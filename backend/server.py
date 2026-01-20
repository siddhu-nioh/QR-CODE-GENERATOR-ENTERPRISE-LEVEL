from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, WebSocket
from fastapi.responses import StreamingResponse, RedirectResponse, HTMLResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from pathlib import Path
import os
import logging
import uuid
import bcrypt
import jwt
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer, CircleModuleDrawer, GappedSquareModuleDrawer
from PIL import Image, ImageDraw, ImageFont
import io
import stripe
import hmac
import hashlib
from urllib.parse import quote
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import base64
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')
JWT_ALGORITHM = 'HS256'
IMAGE_SIGN_SECRET = os.environ.get("QR_IMAGE_SIGN_SECRET", "qr-image-secret")

# Stripe
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
stripe.api_key = STRIPE_API_KEY

# ================= REALTIME WS STORAGE =================
active_connections: set[WebSocket] = set()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

allow_origins = os.environ.get('CORS_ORIGINS', '*').split(',')

# ========== MODELS ==========

# Add to imports


# Define available preloaded logos (match frontend)
PRELOADED_LOGO_NAMES = [
    "applemusic", "bitcoinsv", "carrd", "facebook", "gmail", 
    "indeed", "instagram", "pinterest", "readthedocs", "reddit",
    "spotify", "tiktok", "unitednations", "wechat", "whatsapp",
    "wikiquote", "x", "youtube"
]

# Cache for logo data
LOGO_DATA_CACHE = {}

def get_preloaded_logo(logo_name):
    """Get base64 encoded logo data"""
    if logo_name not in PRELOADED_LOGO_NAMES:
        return None
    
    if logo_name in LOGO_DATA_CACHE:
        return LOGO_DATA_CACHE[logo_name]
    
    try:
        # Assuming logos are in project_root/static/assets/logos/
        logo_path = Path(__file__).parent / "static" / "assets" / "logos" / f"{logo_name}.png"
        
        if logo_path.exists():
            with open(logo_path, "rb") as f:
                logo_bytes = f.read()
            
            # Convert to base64 data URL
            logo_b64 = base64.b64encode(logo_bytes).decode('utf-8')
            logo_data_url = f"data:image/png;base64,{logo_b64}"
            
            LOGO_DATA_CACHE[logo_name] = logo_data_url
            return logo_data_url
    except Exception as e:
        logger.error(f"Error loading logo {logo_name}: {e}")
    
    return None

# In public_qr_image function:


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    plan: str = "free"
    qr_code_count: int = 0
    created_at: datetime

class SessionData(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

class QRCodeCreate(BaseModel):
    name: str
    qr_type: str  # url, text, email, phone, sms, whatsapp, wifi, vcard, pdf, location, payment
    content: Dict[str, Any]
    is_dynamic: bool = False
    design: Optional[Dict[str, Any]] = Field(default_factory=dict) # colors, logo, pattern, frame

class QRCodeUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    design: Optional[Dict[str, Any]] = Field(default_factory=dict)

class QRCode(BaseModel):
    model_config = ConfigDict(extra="ignore")
    qr_id: str
    user_id: str
    name: str
    qr_type: str
    content: Dict[str, Any]
    is_dynamic: bool
    redirect_token: Optional[str] = None
    design: Optional[Dict[str, Any]] = None
    scan_count: int = 0
    created_at: datetime
    updated_at: datetime
    signature: Optional[str] = None

class ScanEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    scan_id: str
    qr_id: str
    user_id: str
    timestamp: datetime
    country: Optional[str] = None
    city: Optional[str] = None
    device: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None
    ip_address: Optional[str] = None

class SubscriptionPlan(BaseModel):
    plan_name: str
    price: float
    qr_limit: int
    features: List[str]

class CheckoutRequest(BaseModel):
    plan_name: str
    origin_url: str

# ========== AUTH HELPERS ==========
def sign_qr_image(qr_id: str, user_id: str, updated_at: str) -> str:
    msg = f"{qr_id}:{user_id}:{updated_at}".encode()
    return hmac.new(
        IMAGE_SIGN_SECRET.encode(),
        msg,
        hashlib.sha256
    ).hexdigest()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(request: Request) -> dict:
    # Check cookie first
    token = request.cookies.get('session_token')
    
    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Verify session token exists in database
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

# ========== QR CODE GENERATION ==========

def generate_qr_content(qr_type: str, content: Dict[str, Any]) -> str:
    """Convert structured content to QR-compatible string"""
    if qr_type == "url":
        return content.get("url", "")
    elif qr_type == "text":
        return content.get("text", "")
    elif qr_type == "email":
        return f"mailto:{content.get('email', '')}?subject={content.get('subject', '')}&body={content.get('body', '')}"
    elif qr_type == "phone":
        return f"tel:{content.get('phone', '')}"
    elif qr_type == "sms":
        return f"sms:{content.get('phone', '')}?body={content.get('message', '')}"
    elif qr_type == "whatsapp":
        return f"https://wa.me/{content.get('phone', '')}?text={content.get('message', '')}"
    elif qr_type == "wifi":
        ssid = content.get('ssid', '')
        password = content.get('password', '')
        encryption = content.get('encryption', 'WPA')
        return f"WIFI:T:{encryption};S:{ssid};P:{password};;"
    elif qr_type == "vcard":
        return f"""BEGIN:VCARD
VERSION:3.0
FN:{content.get('name', '')}
TEL:{content.get('phone', '')}
EMAIL:{content.get('email', '')}
ORG:{content.get('company', '')}
URL:{content.get('website', '')}
END:VCARD"""
    elif qr_type == "location":
        lat = content.get('latitude', '')
        lng = content.get('longitude', '')
        return f"geo:{lat},{lng}"
    elif qr_type == "payment":
        return content.get("payment_url", "")
    else:
        return content.get("url", "")

async def get_user_from_cookie(request: Request) -> dict:
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(status_code=401)

    session = await db.user_sessions.find_one({"session_token": token})
    if not session:
        raise HTTPException(status_code=401)

    user = await db.users.find_one({"user_id": session["user_id"]})
    if not user:
        raise HTTPException(status_code=404)

    return user

def create_gradient_image(size, color1, color2, gradient_type='linear', direction='horizontal'):
    """Create a gradient image"""
    img = Image.new('RGB', size)
    draw = ImageDraw.Draw(img)
    
    if gradient_type == 'linear':
        if direction == 'horizontal':
            for x in range(size[0]):
                ratio = x / size[0]
                r = int(int(color1[1:3], 16) * (1 - ratio) + int(color2[1:3], 16) * ratio)
                g = int(int(color1[3:5], 16) * (1 - ratio) + int(color2[3:5], 16) * ratio)
                b = int(int(color1[5:7], 16) * (1 - ratio) + int(color2[5:7], 16) * ratio)
                draw.line([(x, 0), (x, size[1])], fill=(r, g, b))
        else:  # vertical
            for y in range(size[1]):
                ratio = y / size[1]
                r = int(int(color1[1:3], 16) * (1 - ratio) + int(color2[1:3], 16) * ratio)
                g = int(int(color1[3:5], 16) * (1 - ratio) + int(color2[3:5], 16) * ratio)
                b = int(int(color1[5:7], 16) * (1 - ratio) + int(color2[5:7], 16) * ratio)
                draw.line([(0, y), (size[0], y)], fill=(r, g, b))
    elif gradient_type == 'radial':
        center_x, center_y = size[0] // 2, size[1] // 2
        max_distance = ((center_x ** 2 + center_y ** 2) ** 0.5)
        for y in range(size[1]):
            for x in range(size[0]):
                distance = ((x - center_x) ** 2 + (y - center_y) ** 2) ** 0.5
                ratio = min(distance / max_distance, 1.0)
                r = int(int(color1[1:3], 16) * (1 - ratio) + int(color2[1:3], 16) * ratio)
                g = int(int(color1[3:5], 16) * (1 - ratio) + int(color2[3:5], 16) * ratio)
                b = int(int(color1[5:7], 16) * (1 - ratio) + int(color2[5:7], 16) * ratio)
                draw.point((x, y), fill=(r, g, b))
    
    return img

def apply_pattern_style(qr, pattern_style):
    """Apply pattern style to QR code"""
    module_drawer = None
    
    if pattern_style == 'rounded':
        module_drawer = RoundedModuleDrawer()
    elif pattern_style == 'circle' or pattern_style == 'dots':
        module_drawer = CircleModuleDrawer()
    elif pattern_style == 'gapped':
        module_drawer = GappedSquareModuleDrawer()
    # Default is square (no module_drawer)
    
    return module_drawer

def add_frame_to_qr(img, frame_style, frame_color='#000000', frame_text=''):
    """Add frame around QR code"""
    if not frame_style or frame_style == 'none':
        return img
    
    width, height = img.size
    frame_width = int(width * 0.15)  # 15% frame
    
    # Create new image with frame
    new_size = (width + frame_width * 2, height + frame_width * 2)
    framed_img = Image.new('RGB', new_size, 'white')
    
    # Paste QR in center
    framed_img.paste(img, (frame_width, frame_width))
    
    # Draw frame based on style
    draw = ImageDraw.Draw(framed_img)
    
    if frame_style == 'square':
        draw.rectangle([0, 0, new_size[0]-1, new_size[1]-1], outline=frame_color, width=frame_width//2)
    elif frame_style == 'rounded':
        # Draw rounded rectangle frame
        radius = frame_width
        draw.rounded_rectangle([0, 0, new_size[0]-1, new_size[1]-1], radius=radius, outline=frame_color, width=frame_width//2)
    elif frame_style == 'circle':
        # Draw circular frame
        draw.ellipse([0, 0, new_size[0]-1, new_size[1]-1], outline=frame_color, width=frame_width//2)
    
    # Add frame text if provided
    if frame_text:
        try:
            font_size = frame_width // 2
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
            except:
                font = ImageFont.load_default()
            
            # Get text bounding box
            bbox = draw.textbbox((0, 0), frame_text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            # Draw text at bottom center
            text_x = (new_size[0] - text_width) // 2
            text_y = new_size[1] - frame_width + (frame_width - text_height) // 2
            
            draw.text((text_x, text_y), frame_text, fill=frame_color, font=font)
        except:
            pass
    
    return framed_img

def add_logo_to_qr(img, logo_data, logo_size_percent=20):
    """Add logo to center of QR code"""
    try:
        # Open logo image
        logo = Image.open(io.BytesIO(logo_data))
        
        # Calculate logo size (percentage of QR size)
        qr_width, qr_height = img.size
        logo_max_size = int(min(qr_width, qr_height) * (logo_size_percent / 100))
        
        # Resize logo maintaining aspect ratio
        logo.thumbnail((logo_max_size, logo_max_size), Image.Resampling.LANCZOS)
        
        # Create white background for logo
        logo_bg_size = int(logo.size[0] * 1.2), int(logo.size[1] * 1.2)
        logo_bg = Image.new('RGB', logo_bg_size, 'white')
        
        # Paste logo on white background
        logo_pos = ((logo_bg_size[0] - logo.size[0]) // 2, (logo_bg_size[1] - logo.size[1]) // 2)
        if logo.mode == 'RGBA':
            logo_bg.paste(logo, logo_pos, logo)
        else:
            logo_bg.paste(logo, logo_pos)
        
        # Paste logo background on QR code
        logo_bg_pos = ((qr_width - logo_bg_size[0]) // 2, (qr_height - logo_bg_size[1]) // 2)
        img.paste(logo_bg, logo_bg_pos)
        
        return img
    except Exception as e:
        logger.error(f"Error adding logo: {e}")
        return img

def create_qr_image(data: str, design: Optional[Dict[str, Any]] = None) -> bytes:
    """Generate QR code image with advanced customization"""
    
    # Default design values
    fg_color = "#000000"
    bg_color = "#FFFFFF"
    error_correction_level = "H"
    pattern_style = "square"
    gradient_enabled = False
    gradient_color1 = None
    gradient_color2 = None
    gradient_type = "linear"
    gradient_direction = "horizontal"
    frame_style = "none"
    frame_color = "#000000"
    frame_text = ""
    logo_data = None
    
    # Parse design options
    if design:
        fg_color = design.get("foreground_color", fg_color)
        bg_color = design.get("background_color", bg_color)
        error_correction_level = design.get("error_correction", "H")
        pattern_style = design.get("pattern_style", "square")
        gradient_enabled = design.get("gradient_enabled", False)
        gradient_color1 = design.get("gradient_color1")
        gradient_color2 = design.get("gradient_color2")
        gradient_type = design.get("gradient_type", "linear")
        gradient_direction = design.get("gradient_direction", "horizontal")
        frame_style = design.get("frame_style", "none")
        frame_color = design.get("frame_color", "#000000")
        frame_text = design.get("frame_text", "")
        logo_data = design.get("logo_data")  # base64 encoded or bytes
    
    # Map error correction level
    error_correction_map = {
        "L": qrcode.constants.ERROR_CORRECT_L,
        "M": qrcode.constants.ERROR_CORRECT_M,
        "Q": qrcode.constants.ERROR_CORRECT_Q,
        "H": qrcode.constants.ERROR_CORRECT_H
    }
    error_correction = error_correction_map.get(error_correction_level, qrcode.constants.ERROR_CORRECT_H)
    
    # Create QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=error_correction,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    # Apply pattern style
    module_drawer = apply_pattern_style(qr, pattern_style)
    
    # Generate image with pattern
    if module_drawer:
        img = qr.make_image(
            image_factory=StyledPilImage,
            module_drawer=module_drawer,
            fill_color=fg_color,
            back_color=bg_color
        )
    else:
        img = qr.make_image(fill_color=fg_color, back_color=bg_color)
    
    # Convert to PIL Image
    if not isinstance(img, Image.Image):
        pil_img = img.convert('RGB')
    else:
        pil_img = img
    
    # Apply gradient if enabled
    if gradient_enabled and gradient_color1 and gradient_color2:
        # Create gradient mask
        gradient_mask = create_gradient_image(
            pil_img.size, 
            gradient_color1, 
            gradient_color2, 
            gradient_type, 
            gradient_direction
        )
        
        # Apply gradient only to foreground (black parts)
        qr_pixels = pil_img.load()
        grad_pixels = gradient_mask.load()
        result_img = Image.new('RGB', pil_img.size, bg_color)
        result_pixels = result_img.load()
        
        for y in range(pil_img.size[1]):
            for x in range(pil_img.size[0]):
                if qr_pixels[x, y] != (255, 255, 255):  # If not white (background)
                    result_pixels[x, y] = grad_pixels[x, y]
                else:
                    result_pixels[x, y] = qr_pixels[x, y]
        
        pil_img = result_img
    
    # Add logo if provided
    if logo_data:
        try:
            # If logo_data is base64 string, decode it
            if isinstance(logo_data, str) and logo_data.startswith('data:image'):
                # Extract base64 part
                logo_data = logo_data.split(',')[1]
                import base64
                logo_data = base64.b64decode(logo_data)
            pil_img = add_logo_to_qr(pil_img, logo_data)
        except Exception as e:
            logger.error(f"Error processing logo: {e}")
    
    # Add frame
    if frame_style and frame_style != 'none':
        pil_img = add_frame_to_qr(pil_img, frame_style, frame_color, frame_text)
    
    # Convert to bytes
    img_byte_arr = io.BytesIO()
    pil_img.save(img_byte_arr, format='PNG', quality=95)
    img_byte_arr.seek(0)
    return img_byte_arr.getvalue()

# ========== AUTH ROUTES ==========

@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_pw,
        "picture": None,
        "plan": "free",
        "qr_code_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create session
    session_token = create_jwt_token(user_id, user_data.email)
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    return {
        "user": {
            "user_id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "plan": "free"
        },
        "session_token": session_token
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create session
    session_token = create_jwt_token(user["user_id"], user["email"])
    session_doc = {
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "plan": user.get("plan", "free"),
            "qr_code_count": user.get("qr_code_count", 0)
        },
        "session_token": session_token
    }

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture"),
        "plan": user.get("plan", "free"),
        "qr_code_count": user.get("qr_code_count", 0)
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get('session_token')
    if token:
        await db.user_sessions.delete_one({"session_token": token})
        response.delete_cookie("session_token")
    return {"message": "Logged out"}

@api_router.post("/auth/google")
async def google_login(request: Request, response: Response):
    body = await request.json()
    token = body.get("credential")

    if not token:
        raise HTTPException(status_code=400, detail="Missing Google token")

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            os.environ["GOOGLE_CLIENT_ID"]
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = idinfo["email"]
    name = idinfo.get("name", "")
    picture = idinfo.get("picture")

    user = await db.users.find_one({"email": email})

    if not user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "plan": "free",
            "qr_code_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user)

    session_token = create_jwt_token(user["user_id"], email)

    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )

    return {
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "picture": picture,
            "plan": user.get("plan", "free")
        },
        "session_token": session_token
    }



# ========== DESIGN TEMPLATES ==========

DESIGN_TEMPLATES = {
    "simple": {"name": "Simple", "foreground_color": "#000000", "background_color": "#FFFFFF", "pattern_style": "square"},
    "instagram": {"name": "Instagram", "foreground_color": "#E1306C", "background_color": "#FFFFFF", "pattern_style": "rounded", "gradient_enabled": True, "gradient_color1": "#F58529", "gradient_color2": "#C13584"},
    "facebook": {"name": "Facebook", "foreground_color": "#1877F2", "background_color": "#FFFFFF", "pattern_style": "rounded"},
    "tiktok": {"name": "TikTok", "foreground_color": "#000000", "background_color": "#FFFFFF", "pattern_style": "rounded"},
    "whatsapp": {"name": "WhatsApp", "foreground_color": "#25D366", "background_color": "#FFFFFF", "pattern_style": "rounded"},
    "linkedin": {"name": "LinkedIn", "foreground_color": "#0A66C2", "background_color": "#FFFFFF", "pattern_style": "square"},
    "youtube": {"name": "YouTube", "foreground_color": "#FF0000", "background_color": "#FFFFFF", "pattern_style": "rounded"},
    "spotify": {"name": "Spotify", "foreground_color": "#1DB954", "background_color": "#000000", "pattern_style": "rounded"},
    "twitter": {"name": "Twitter/X", "foreground_color": "#000000", "background_color": "#FFFFFF", "pattern_style": "circle"},
    "snapchat": {"name": "Snapchat", "foreground_color": "#FFFC00", "background_color": "#000000", "pattern_style": "rounded"},
    "pinterest": {"name": "Pinterest", "foreground_color": "#E60023", "background_color": "#FFFFFF", "pattern_style": "circle"},
    "reddit": {"name": "Reddit", "foreground_color": "#FF4500", "background_color": "#FFFFFF", "pattern_style": "circle"},
    "wifi": {"name": "WiFi", "foreground_color": "#4285F4", "background_color": "#FFFFFF", "pattern_style": "rounded"},
    "vcard": {"name": "vCard", "foreground_color": "#34A853", "background_color": "#FFFFFF", "pattern_style": "square"},
    "pdf": {"name": "PDF", "foreground_color": "#F40F02", "background_color": "#FFFFFF", "pattern_style": "square"},
    "email": {"name": "Email", "foreground_color": "#EA4335", "background_color": "#FFFFFF", "pattern_style": "rounded"},
    "phone": {"name": "Phone", "foreground_color": "#34A853", "background_color": "#FFFFFF", "pattern_style": "circle"},
    "sms": {"name": "SMS", "foreground_color": "#FBBC05", "background_color": "#FFFFFF", "pattern_style": "rounded"},
    "location": {"name": "Location", "foreground_color": "#EA4335", "background_color": "#FFFFFF", "pattern_style": "circle"},
    "bitcoin": {"name": "Bitcoin", "foreground_color": "#F7931A", "background_color": "#FFFFFF", "pattern_style": "square"},
}

@api_router.get("/design-templates")
async def get_design_templates():
    """Get all available design templates"""
    return {"templates": DESIGN_TEMPLATES}

@api_router.post("/upload-logo")
async def upload_logo(request: Request, user: dict = Depends(get_current_user)):
    """Upload logo for QR code"""
    try:
        form = await request.form()
        logo_file = form.get("logo")
        
        if not logo_file:
            raise HTTPException(status_code=400, detail="No logo file provided")
        
        # Read file content
        logo_content = await logo_file.read()
        
        # Validate image
        try:
            img = Image.open(io.BytesIO(logo_content))
            img.verify()
        except:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Convert to base64
        import base64
        logo_base64 = base64.b64encode(logo_content).decode('utf-8')
        logo_data_url = f"data:image/png;base64,{logo_base64}"
        
        return {"logo_data": logo_data_url}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading logo: {e}")
        raise HTTPException(status_code=500, detail=str(e))


#         raise HTTPException(status_code=500, detail=str(e))

# ========== QR CODE ROUTES ==========

@api_router.post("/qr-codes", response_model=QRCode)
async def create_qr_code(qr_data: QRCodeCreate, user: dict = Depends(get_current_user)):
    plan = user.get("plan", "free")
    qr_count = user.get("qr_code_count", 0)

    if plan == "free" and qr_count >= 5:
        raise HTTPException(status_code=403, detail="Free plan limit reached")

    qr_id = f"qr_{uuid.uuid4().hex[:12]}"

    # ✅ BACKEND IS SOURCE OF TRUTH
    is_dynamic = plan != "free"
    redirect_token = f"r_{uuid.uuid4().hex[:8]}" if is_dynamic else None

    qr_doc = {
        "qr_id": qr_id,
        "user_id": user["user_id"],
        "name": qr_data.name,
        "qr_type": qr_data.qr_type,
        "content": qr_data.content,
        "is_dynamic": is_dynamic,
        "redirect_token": redirect_token,
        "design": qr_data.design,
        "scan_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    await db.qr_codes.insert_one(qr_doc)

    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$inc": {"qr_code_count": 1}}
    )

    qr_doc["created_at"] = datetime.fromisoformat(qr_doc["created_at"])
    qr_doc["updated_at"] = datetime.fromisoformat(qr_doc["updated_at"])

    return QRCode(**qr_doc)

@api_router.get("/qr-codes", response_model=List[QRCode])
async def get_qr_codes(user: dict = Depends(get_current_user)):
    qr_codes = await db.qr_codes.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(1000)
    
    # Convert dates
    for qr in qr_codes:
        qr["signature"] = sign_qr_image(
            qr["qr_id"],
            qr["user_id"],
            qr["updated_at"]
        )

        if isinstance(qr["created_at"], str):
            qr["created_at"] = datetime.fromisoformat(qr["created_at"])
        if isinstance(qr["updated_at"], str):
            qr["updated_at"] = datetime.fromisoformat(qr["updated_at"])
    
    return qr_codes

@api_router.get("/qr-codes/{qr_id}", response_model=QRCode)
async def get_qr_code(qr_id: str, user: dict = Depends(get_current_user)):
    qr = await db.qr_codes.find_one({"qr_id": qr_id, "user_id": user["user_id"]}, {"_id": 0})
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    
    if isinstance(qr["created_at"], str):
        qr["created_at"] = datetime.fromisoformat(qr["created_at"])
    if isinstance(qr["updated_at"], str):
        qr["updated_at"] = datetime.fromisoformat(qr["updated_at"])
    
    return QRCode(**qr)

@api_router.put("/qr-codes/{qr_id}", response_model=QRCode)
async def update_qr_code(qr_id: str, update_data: QRCodeUpdate, user: dict = Depends(get_current_user)):
    qr = await db.qr_codes.find_one({"qr_id": qr_id, "user_id": user["user_id"]}, {"_id": 0})
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    
    update_fields = {}
    if update_data.name:
        update_fields["name"] = update_data.name
    if update_data.content:
        update_fields["content"] = update_data.content
    if update_data.design:
        update_fields["design"] = update_data.design
    
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.qr_codes.update_one({"qr_id": qr_id}, {"$set": update_fields})
    
    updated_qr = await db.qr_codes.find_one({"qr_id": qr_id}, {"_id": 0})
    
    if isinstance(updated_qr["created_at"], str):
        updated_qr["created_at"] = datetime.fromisoformat(updated_qr["created_at"])
    if isinstance(updated_qr["updated_at"], str):
        updated_qr["updated_at"] = datetime.fromisoformat(updated_qr["updated_at"])
    
    return QRCode(**updated_qr)

@api_router.delete("/qr-codes/{qr_id}")
async def delete_qr_code(qr_id: str, user: dict = Depends(get_current_user)):
    result = await db.qr_codes.delete_one({"qr_id": qr_id, "user_id": user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="QR code not found")
    
    # Decrement count
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$inc": {"qr_code_count": -1}}
    )
    
    return {"message": "QR code deleted"}

@api_router.get("/qr-codes/{qr_id}/image")
async def get_qr_image(qr_id: str, format: str = "png", user: dict = Depends(get_current_user)):
    qr = await db.qr_codes.find_one({"qr_id": qr_id, "user_id": user["user_id"]}, {"_id": 0})
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    
    # Generate content
    if qr["is_dynamic"]:
        # For dynamic, encode redirect URL
        redirect_url = f"{os.getenv('API_BASE_URL')}/api/r/{qr['redirect_token']}"
        qr_content = redirect_url
    else:
        qr_content = generate_qr_content(qr["qr_type"], qr["content"])
    
    # Generate image with advanced customization
    img_bytes = create_qr_image(qr_content, qr.get("design"))
    
    # Check if free plan - add watermark
    user_doc = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if user_doc.get("plan") == "free":
        # Add simple watermark text
        img = Image.open(io.BytesIO(img_bytes))
        draw = ImageDraw.Draw(img)
        text = "QRPlanet"
        # Add text at bottom
        width, height = img.size
        draw.text((width//2 - 30, height - 20), text, fill="gray")
        
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        img_bytes = img_byte_arr.getvalue()
    
    return StreamingResponse(io.BytesIO(img_bytes), media_type="image/png")

@api_router.post("/qr-codes/{qr_id}/make-dynamic")
async def make_qr_dynamic(qr_id: str, user: dict = Depends(get_current_user)):
    # Only paid users
    if user.get("plan") == "free":
        raise HTTPException(status_code=403, detail="Upgrade required")

    qr = await db.qr_codes.find_one(
        {"qr_id": qr_id, "user_id": user["user_id"]},
        {"_id": 0}
    )

    if not qr:
        raise HTTPException(status_code=404, detail="QR not found")

    if qr.get("is_dynamic"):
        return {"message": "QR already dynamic"}

    redirect_token = f"r_{uuid.uuid4().hex[:8]}"

    await db.qr_codes.update_one(
        {"qr_id": qr_id},
        {
            "$set": {
                "is_dynamic": True,
                "redirect_token": redirect_token,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )

    return {
        "message": "QR converted to dynamic",
        "redirect_token": redirect_token
    }

# @api_router.get("/public/qr/{qr_id}/image")
# async def public_qr_image(qr_id: str, sig: str):
#     qr = await db.qr_codes.find_one({"qr_id": qr_id}, {"_id": 0})
#     if not qr:
#         raise HTTPException(status_code=404, detail="QR code not found")

#     expected_sig = sign_qr_image(
#         qr_id,
#         qr["user_id"],
#         qr["updated_at"]
#     )

#     if sig != expected_sig:
#         raise HTTPException(status_code=401, detail="Invalid signature")

#     # Generate content
#     if qr["is_dynamic"]:
#         # For dynamic, encode redirect URL
#         redirect_url = f"{os.getenv('API_BASE_URL')}/api/r/{qr['redirect_token']}"
#         qr_content = redirect_url
#     else:
#         qr_content = generate_qr_content(qr["qr_type"], qr["content"])

#     # Generate image with advanced customization
#     img_bytes = create_qr_image(qr_content, qr.get("design"))

#     # Watermark for free plan
#     user_doc = await db.users.find_one({"user_id": qr["user_id"]}, {"_id": 0})
#     if user_doc and user_doc.get("plan") == "free":
#         img = Image.open(io.BytesIO(img_bytes))
#         draw = ImageDraw.Draw(img)
#         w, h = img.size
#         draw.text((w // 2 - 30, h - 20), "QRPlanet", fill="gray")

#         buf = io.BytesIO()
#         img.save(buf, format="PNG")
#         buf.seek(0)
#         img_bytes = buf.getvalue()

#     return StreamingResponse(
#         io.BytesIO(img_bytes),
#         media_type="image/png",
#         headers={"Cache-Control": "public, max-age=3600"}
#     )
@api_router.get("/public/qr/{qr_id}/image")
async def public_qr_image(
    qr_id: str, 
    sig: str,
    request: Request,  # ADD THIS LINE - FIXES THE ERROR
    # Optional design parameters
    fg: Optional[str] = None,
    bg: Optional[str] = None,
    style: Optional[str] = None,
    ec: Optional[str] = None,
    gradient: Optional[str] = None,
    g1: Optional[str] = None,
    g2: Optional[str] = None,
    gtype: Optional[str] = None,
    gdir: Optional[str] = None,
    frame: Optional[str] = None,
    fc: Optional[str] = None,
    ftext: Optional[str] = None,
    logo: Optional[str] = None,
    logo_type: Optional[str] = None,
    logo_name: Optional[str] = None,
    logo_data: Optional[str] = None,
    template_key: Optional[str] = None
):
    qr = await db.qr_codes.find_one({"qr_id": qr_id}, {"_id": 0})
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")

    expected_sig = sign_qr_image(
        qr_id,
        qr["user_id"],
        qr["updated_at"]
    )

    if sig != expected_sig:
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Generate content
    if qr["is_dynamic"]:
        redirect_url = f"{os.getenv('API_BASE_URL')}/api/r/{qr['redirect_token']}"
        qr_content = redirect_url
    else:
        qr_content = generate_qr_content(qr["qr_type"], qr["content"])

    # Start with stored design, or empty dict
    design = qr.get("design") or {}
    
    # ========== HANDLE DESIGN PARAMETERS FROM QUERY ==========
    
    # REMOVE THESE LINES - THEY'RE REDUNDANT (you already have them as parameters)
    # logo_type = request.query_params.get("logo_type")  # DELETE THIS
    # logo_name = request.query_params.get("logo_name")  # DELETE THIS
    
    # Handle preloaded logo using the function parameters
    if logo_type == "preloaded" and logo_name:
        logo_data_url = get_preloaded_logo(logo_name)  # Remove await since it's not async
        if logo_data_url:
            design["logo_data"] = logo_data_url
            design["logo_type"] = "preloaded"
            design["template_logo"] = logo_name
    
    # Apply query parameters if provided
    if fg:
        design["foreground_color"] = f"#{fg}" if not fg.startswith("#") else fg
    if bg:
        design["background_color"] = f"#{bg}" if not bg.startswith("#") else bg
    
    # Pattern and error correction
    if style:
        design["pattern_style"] = style
    if ec:
        design["error_correction"] = ec
    
    # Gradient
    if gradient:
        design["gradient_enabled"] = True
    if g1:
        design["gradient_color1"] = f"#{g1}" if not g1.startswith("#") else g1
    if g2:
        design["gradient_color2"] = f"#{g2}" if not g2.startswith("#") else g2
    if gtype:
        design["gradient_type"] = gtype
    if gdir:
        design["gradient_direction"] = gdir
    
    # Frame
    if frame:
        design["frame_style"] = frame
    if fc:
        design["frame_color"] = f"#{fc}" if not fc.startswith("#") else fc
    if ftext:
        design["frame_text"] = ftext
    
    # Handle custom logo from parameters
    if logo_type == "custom" and logo_data:
        try:
            design["logo_data"] = logo_data
            design["logo_type"] = "custom"
        except:
            pass
    
    # Template key
    if template_key:
        design["template_key"] = template_key
    
    # ========== END OF DESIGN PARAMETERS ==========

    # Generate image with customization
    img_bytes = create_qr_image(qr_content, design)

    # Watermark for free plan
    user_doc = await db.users.find_one({"user_id": qr["user_id"]}, {"_id": 0})
    if user_doc and user_doc.get("plan") == "free":
        img = Image.open(io.BytesIO(img_bytes))
        draw = ImageDraw.Draw(img)
        w, h = img.size
        draw.text((w // 2 - 30, h - 20), "QRPlanet", fill="gray")

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        img_bytes = buf.getvalue()

    return StreamingResponse(
        io.BytesIO(img_bytes),
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=3600"}
    )

@api_router.get("/r/{token}")
async def redirect_qr(token: str, request: Request):
    qr = await db.qr_codes.find_one({"redirect_token": token}, {"_id": 0})

    if not qr:
        return HTMLResponse("<h1>QR not found</h1>", status_code=404)

    # ================= ANALYTICS =================
    scan_id = f"scan_{uuid.uuid4().hex[:12]}"
    user_agent = request.headers.get("user-agent", "")

    # More detailed user agent parsing
    device = "desktop"
    if any(x in user_agent.lower() for x in ["mobile", "android", "iphone", "ipad"]):
        device = "mobile"
    elif "tablet" in user_agent.lower():
        device = "tablet"
    
    # Browser detection
    browser = "unknown"
    if "chrome" in user_agent.lower():
        browser = "Chrome"
    elif "firefox" in user_agent.lower():
        browser = "Firefox"
    elif "safari" in user_agent.lower():
        browser = "Safari"
    elif "edge" in user_agent.lower():
        browser = "Edge"
    
    # OS detection
    os_type = "unknown"
    if "windows" in user_agent.lower():
        os_type = "Windows"
    elif "mac" in user_agent.lower():
        os_type = "macOS"
    elif "linux" in user_agent.lower():
        os_type = "Linux"
    elif "android" in user_agent.lower():
        os_type = "Android"
    elif "ios" in user_agent.lower() or "iphone" in user_agent.lower():
        os_type = "iOS"

    scan_doc = {
        "scan_id": scan_id,
        "qr_id": qr["qr_id"],
        "user_id": qr["user_id"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "device": device,
        "browser": browser,
        "os": os_type,
        "ip_address": request.client.host if request.client else None,
        "country": None,
        "city": None,
        "user_agent": user_agent
    }

    await db.scan_events.insert_one(scan_doc)

    await db.qr_codes.update_one(
        {"qr_id": qr["qr_id"]},
        {"$inc": {"scan_count": 1}}
    )

    # ================= REALTIME PUSH =================
    for ws in list(active_connections):
        try:
            await ws.send_json({
                "type": "qr_scan",
                "qr_id": qr["qr_id"]
            })
        except:
            active_connections.remove(ws)

    qr_type = qr.get("qr_type")
    content = qr.get("content") or {}

    # ===== SAFE REDIRECT TYPES =====
    if qr_type == "url":
        return RedirectResponse(str(content.get("url", "")))

    if qr_type == "payment":
        return RedirectResponse(str(content.get("payment_url", "")))

    if qr_type == "phone":
        return RedirectResponse(f"tel:{content.get('phone','')}")

    if qr_type == "email":
        return RedirectResponse(
            f"mailto:{content.get('email','')}?"
            f"subject={quote(str(content.get('subject','')))}&"
            f"body={quote(str(content.get('body','')))}"
        )

    if qr_type == "sms":
        return RedirectResponse(
            f"sms:{content.get('phone','')}?"
            f"body={quote(str(content.get('message','')))}"
        )

    if qr_type == "whatsapp":
        return RedirectResponse(
            f"https://wa.me/{content.get('phone','')}?"
            f"text={quote(str(content.get('message','')))}"
        )

    if qr_type == "location":
        lat = content.get("latitude")
        lng = content.get("longitude")
        return RedirectResponse(f"https://maps.google.com/?q={lat},{lng}")

    # ===== LANDING PAGE (SAFE) =====
    text = str(content.get("text", ""))
    ssid = str(content.get("ssid", ""))
    password = str(content.get("password", ""))
    name = str(content.get("name", ""))
    phone = str(content.get("phone", ""))
    email = str(content.get("email", ""))

    return HTMLResponse(
        f"""
        <html>
          <head>
            <title>{qr.get("name","QR Code")}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              body {{ font-family: Arial; padding: 24px; }}
              .card {{ max-width: 480px; margin: auto; }}
            </style>
          </head>
          <body>
            <div class="card">
              <h2>{qr.get("name","QR Code")}</h2>

              {f"<p>{text}</p>" if qr_type=="text" else ""}
              {f"<p><b>WiFi:</b> {ssid}</p><p>Password: {password}</p>" if qr_type=="wifi" else ""}
              {f"<p>{name}</p><p>{phone}</p><p>{email}</p>" if qr_type=="vcard" else ""}
            </div>
          </body>
        </html>
        """,
        status_code=200
    )

# ========== ANALYTICS ROUTES ==========

@api_router.get("/qr-codes/{qr_id}/analytics")
async def get_qr_analytics(qr_id: str, user: dict = Depends(get_current_user)):
    qr = await db.qr_codes.find_one({"qr_id": qr_id, "user_id": user["user_id"]}, {"_id": 0})
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    
    if not qr["is_dynamic"]:
        raise HTTPException(status_code=400, detail="Analytics only available for dynamic QR codes")
    
    # Check plan
    user_doc = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if user_doc.get("plan") == "free":
        raise HTTPException(status_code=403, detail="Analytics require paid plan")
    
    # Get scan events
    scans = await db.scan_events.find({"qr_id": qr_id}, {"_id": 0}).to_list(10000)
    
    # Calculate stats
    total_scans = len(scans)
    unique_ips = len(set(s.get("ip_address") for s in scans if s.get("ip_address")))
    
    # Device breakdown
    devices = {}
    browsers = {}
    os_stats = {}
    countries = {}
    cities = {}
    
    for scan in scans:
        device = scan.get("device", "unknown")
        devices[device] = devices.get(device, 0) + 1
        
        browser = scan.get("browser", "unknown")
        browsers[browser] = browsers.get(browser, 0) + 1
        
        os = scan.get("os", "unknown")
        os_stats[os] = os_stats.get(os, 0) + 1
        
        country = scan.get("country")
        if country:
            countries[country] = countries.get(country, 0) + 1
        
        city = scan.get("city")
        if city:
            cities[city] = cities.get(city, 0) + 1
    
    # Scans over time (last 30 days)
    from collections import defaultdict
    scans_by_date = defaultdict(int)
    scans_by_hour = defaultdict(int)
    
    for scan in scans:
        timestamp = scan.get("timestamp")
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp)
        date_str = timestamp.strftime("%Y-%m-%d")
        hour_str = timestamp.strftime("%H:00")
        scans_by_date[date_str] += 1
        scans_by_hour[hour_str] += 1
    
    # Convert to sorted lists for charts
    scans_by_date_list = [{"date": k, "scans": v} for k, v in sorted(scans_by_date.items())]
    scans_by_hour_list = [{"hour": k, "scans": v} for k, v in sorted(scans_by_hour.items())]
    
    # Top locations
    top_countries = sorted([{"name": k, "count": v} for k, v in countries.items()], key=lambda x: x["count"], reverse=True)[:10]
    top_cities = sorted([{"name": k, "count": v} for k, v in cities.items()], key=lambda x: x["count"], reverse=True)[:10]
    
    return {
        "total_scans": total_scans,
        "unique_scans": unique_ips,
        "devices": [{"name": k, "count": v} for k, v in devices.items()],
        "browsers": [{"name": k, "count": v} for k, v in browsers.items()],
        "operating_systems": [{"name": k, "count": v} for k, v in os_stats.items()],
        "scans_by_date": scans_by_date_list,
        "scans_by_hour": scans_by_hour_list,
        "top_countries": top_countries,
        "top_cities": top_cities,
        "recent_scans": scans[-50:][::-1] if scans else []  # Last 50 scans, reversed
    }

@api_router.post("/track-scan/{qr_id}")
async def track_qr_scan(qr_id: str, request: Request):
    """Track QR code scan with detailed analytics"""
    try:
        qr = await db.qr_codes.find_one({"qr_id": qr_id}, {"_id": 0})
        if not qr:
            raise HTTPException(status_code=404, detail="QR code not found")
        
        # Parse user agent
        user_agent = request.headers.get("user-agent", "")
        
        # Basic device detection
        device = "desktop"
        if any(x in user_agent.lower() for x in ["mobile", "android", "iphone", "ipad"]):
            device = "mobile"
        elif "tablet" in user_agent.lower():
            device = "tablet"
        
        # Browser detection
        browser = "unknown"
        if "chrome" in user_agent.lower():
            browser = "Chrome"
        elif "firefox" in user_agent.lower():
            browser = "Firefox"
        elif "safari" in user_agent.lower():
            browser = "Safari"
        elif "edge" in user_agent.lower():
            browser = "Edge"
        
        # OS detection
        os_type = "unknown"
        if "windows" in user_agent.lower():
            os_type = "Windows"
        elif "mac" in user_agent.lower():
            os_type = "macOS"
        elif "linux" in user_agent.lower():
            os_type = "Linux"
        elif "android" in user_agent.lower():
            os_type = "Android"
        elif "ios" in user_agent.lower() or "iphone" in user_agent.lower():
            os_type = "iOS"
        
        # Get IP address
        ip_address = request.client.host if request.client else None
        
        # Try to get location from IP (basic - in production use a geolocation service)
        country = None
        city = None
        
        # Log scan event
        scan_id = f"scan_{uuid.uuid4().hex[:12]}"
        scan_doc = {
            "scan_id": scan_id,
            "qr_id": qr_id,
            "user_id": qr["user_id"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "device": device,
            "browser": browser,
            "os": os_type,
            "ip_address": ip_address,
            "country": country,
            "city": city,
            "user_agent": user_agent
        }
        
        await db.scan_events.insert_one(scan_doc)
        
        # Increment scan count
        await db.qr_codes.update_one({"qr_id": qr_id}, {"$inc": {"scan_count": 1}})
        
        return {"status": "success", "scan_id": scan_id}
    except Exception as e:
        logger.error(f"Error tracking scan: {e}")
        return {"status": "error", "message": str(e)}

# ========== BILLING ROUTES ==========

@api_router.get("/plans")
async def get_plans():
    plans = [
        {"plan_name": "free", "price": 0.0, "qr_limit": 5, "features": ["5 Static QR codes", "PNG export only", "Watermark"]},
        {"plan_name": "starter", "price": 9.99, "qr_limit": 50, "features": ["50 QR codes", "Dynamic QR", "Basic analytics", "All export formats"]},
        {"plan_name": "pro", "price": 29.99, "qr_limit": 500, "features": ["500 QR codes", "Dynamic QR", "Advanced analytics", "Logo upload", "Priority support"]},
        {"plan_name": "enterprise", "price": 99.99, "qr_limit": -1, "features": ["Unlimited QR codes", "All features", "API access", "White-label", "Dedicated support"]}
    ]
    return plans

@api_router.post("/billing/checkout")
async def create_checkout(
    checkout_req: CheckoutRequest,
    request: Request,
    user: dict = Depends(get_current_user)
):
    plan_prices = {
        "starter": 9.99,
        "pro": 29.99,
        "enterprise": 99.99
    }

    if checkout_req.plan_name not in plan_prices:
        raise HTTPException(status_code=400, detail="Invalid plan")

    origin_url = checkout_req.origin_url
    amount = int(plan_prices[checkout_req.plan_name] * 100)  # ✅ cents

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": f"{checkout_req.plan_name.capitalize()} Plan"
                    },
                    "unit_amount": amount,  # ✅ integer
                    "recurring": {"interval": "month"}
                },
                "quantity": 1
            }],
            success_url=f"{origin_url}/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{origin_url}/billing",
            metadata={
                "user_id": user["user_id"],
                "plan_name": checkout_req.plan_name
            }
        )

        await db.payment_transactions.insert_one({
            "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
            "user_id": user["user_id"],
            "session_id": session.id,
            "plan_name": checkout_req.plan_name,
            "amount": amount / 100,  # store dollars in DB
            "currency": "usd",
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        return {"url": session.url, "session_id": session.id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/billing/status/{session_id}")
async def checkout_status(session_id: str, user: dict = Depends(get_current_user)):
    session = stripe.checkout.Session.retrieve(session_id)

    if session.payment_status == "paid":
        plan = session.metadata["plan_name"]
        user_id = user["user_id"]

        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"plan": plan}}
        )

        # ✅ FORCE UPGRADE OLD QRs
        await db.qr_codes.update_many(
            {"user_id": user_id, "is_dynamic": False},
            {"$set": {
                "is_dynamic": True,
                "redirect_token": f"r_{uuid.uuid4().hex[:8]}",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )

    return {
        "status": session.status,
        "payment_status": session.payment_status
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["metadata"]["user_id"]
        plan = session["metadata"]["plan_name"]

        #  1. Update user plan
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"plan": plan}}
        )

        #  2. UPGRADE ALL EXISTING QRs TO DYNAMIC
        await db.qr_codes.update_many(
            {
                "user_id": user_id,
                "is_dynamic": False
            },
            {
                "$set": {
                    "is_dynamic": True,
                    "redirect_token": f"r_{uuid.uuid4().hex[:8]}",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )

    return {"status": "success"}

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    active_connections.add(ws)
    try:
        while True:
            await ws.receive_text()
    except:
        pass
    finally:
        active_connections.remove(ws)

# ========== MAIN APP ==========

@api_router.get("/")
async def root():
    return {"message": "QR Code SaaS API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()