from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import StreamingResponse, RedirectResponse
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
from qrcode.image.styles.colormasks import SolidFillColorMask
from PIL import Image, ImageDraw, ImageFont
import io
import segno
# from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
import stripe
import hmac
import hashlib


from fastapi import WebSocket




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
# STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

stripe.api_key = STRIPE_API_KEY

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

allow_origins=os.environ.get('CORS_ORIGINS', '*').split(',')

# ========== MODELS ==========

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
    design: Optional[Dict[str, Any]] = None  # colors, logo, pattern, frame

class QRCodeUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    design: Optional[Dict[str, Any]] = None

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


def create_qr_image(data: str, design: Optional[Dict[str, Any]] = None) -> bytes:
    """Generate QR code image with optional customization"""
    
    # Default design
    fg_color = "#000000"
    bg_color = "#FFFFFF"
    error_correction = qrcode.constants.ERROR_CORRECT_H
    
    if design:
        fg_color = design.get("foreground_color", fg_color)
        bg_color = design.get("background_color", bg_color)
    
    # Create QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=error_correction,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    # Generate image
    img = qr.make_image(fill_color=fg_color, back_color=bg_color)
    
    # Convert to PIL Image for further customization
    if isinstance(img, Image.Image):
        pil_img = img
    else:
        pil_img = img.convert('RGB')
    
    # Add logo if provided (center)
    if design and design.get("logo_url"):
        try:
            # For now, skip logo (would need to download from URL)
            pass
        except:
            pass
    
    # Convert to bytes
    img_byte_arr = io.BytesIO()
    pil_img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr.getvalue()

# ========== AUTH ROUTES ==========
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_text("Connected")
    await websocket.close()


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
    secure=True,          # REQUIRED for Vercel (HTTPS)
    samesite="none",      # REQUIRED for cross-site
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

# ========== EMERGENT GOOGLE AUTH INTEGRATION ==========
# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

@api_router.post("/auth/emergent-session")
async def emergent_auth_session(request: Request, response: Response):
    """Exchange Emergent session_id for user session"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth API
    import httpx
    async with httpx.AsyncClient() as client:
        auth_response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        
        auth_data = auth_response.json()
    
    # Check if user exists
    user = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    
    if not user:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data.get("picture"),
            "plan": "free",
            "qr_code_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        user = user_doc
    
    # Create session
    session_token = auth_data["session_token"]
    session_doc = {
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
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
            "picture": user.get("picture"),
            "plan": user.get("plan", "free"),
            "qr_code_count": user.get("qr_code_count", 0)
        },
        "session_token": session_token
    }

# ========== QR CODE ROUTES ==========

@api_router.post("/qr-codes", response_model=QRCode)
async def create_qr_code(qr_data: QRCodeCreate, user: dict = Depends(get_current_user)):
    # Check plan limits
    plan = user.get("plan", "free")
    qr_count = user.get("qr_code_count", 0)
    
    if plan == "free" and qr_count >= 5:
        raise HTTPException(status_code=403, detail="Free plan limit reached (5 QR codes)")
    
    if plan == "free" and qr_data.is_dynamic:
        raise HTTPException(status_code=403, detail="Dynamic QR codes are for paid plans only")
    
    # Create QR
    qr_id = f"qr_{uuid.uuid4().hex[:12]}"
    redirect_token = f"r_{uuid.uuid4().hex[:8]}" if qr_data.is_dynamic else None
    # ✅ Backend-enforced dynamic logic (DO NOT TRUST FRONTEND)
    is_dynamic = False
    redirect_token = None

    if user.get("plan") != "free" and qr_data.is_dynamic:
        is_dynamic = True
        redirect_token = f"r_{uuid.uuid4().hex[:8]}"

    
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
    
    # Update user QR count
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$inc": {"qr_code_count": 1}}
    )
    
    # Return without _id
    qr_doc.pop("_id", None)
    if isinstance(qr_doc["created_at"], str):
        qr_doc["created_at"] = datetime.fromisoformat(qr_doc["created_at"])
    if isinstance(qr_doc["updated_at"], str):
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
        redirect_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/r/{qr['redirect_token']}"
        qr_content = redirect_url
    else:
        qr_content = generate_qr_content(qr["qr_type"], qr["content"])
    
    # Generate image
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


    
@api_router.get("/public/qr/{qr_id}/image")
async def public_qr_image(qr_id: str, sig: str):
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
        redirect_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/r/{qr['redirect_token']}"
        qr_content = redirect_url
    else:
        qr_content = generate_qr_content(qr["qr_type"], qr["content"])

    img_bytes = create_qr_image(qr_content, qr.get("design"))

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


# ========== DYNAMIC QR REDIRECT ==========

@api_router.get("/r/{token}")
async def redirect_qr(token: str, request: Request):
    """Redirect endpoint for dynamic QR codes with analytics"""
    qr = await db.qr_codes.find_one({"redirect_token": token}, {"_id": 0})
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    
    # Log scan event
    scan_id = f"scan_{uuid.uuid4().hex[:12]}"
    user_agent = request.headers.get("user-agent", "")
    
    scan_doc = {
        "scan_id": scan_id,
        "qr_id": qr["qr_id"],
        "user_id": qr["user_id"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "device": "mobile" if "mobile" in user_agent.lower() else "desktop",
        "browser": "unknown",
        "os": "unknown",
        "ip_address": request.client.host if request.client else None,
        "country": None,
        "city": None
    }
    
    await db.scan_events.insert_one(scan_doc)
    
    # Increment scan count
    await db.qr_codes.update_one({"qr_id": qr["qr_id"]}, {"$inc": {"scan_count": 1}})
    
    # Generate final URL
    target_url = generate_qr_content(qr["qr_type"], qr["content"])
    
    return RedirectResponse(url=target_url)

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
    for scan in scans:
        device = scan.get("device", "unknown")
        devices[device] = devices.get(device, 0) + 1
    
    # Scans over time (last 30 days)
    from collections import defaultdict
    scans_by_date = defaultdict(int)
    for scan in scans:
        timestamp = scan.get("timestamp")
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp)
        date_str = timestamp.strftime("%Y-%m-%d")
        scans_by_date[date_str] += 1
    
    return {
        "total_scans": total_scans,
        "unique_scans": unique_ips,
        "devices": devices,
        "scans_by_date": dict(scans_by_date),
        "recent_scans": scans[:50]  # Last 50 scans
    }

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

# @api_router.post("/billing/checkout")
# async def create_checkout(checkout_req: CheckoutRequest, request: Request, user: dict = Depends(get_current_user)):
#     """Create Stripe checkout session"""
    
#     # Plan prices
#     plan_prices = {
#         "starter": 9.99,
#         "pro": 29.99,
#         "enterprise": 99.99
#     }
    
#     if checkout_req.plan_name not in plan_prices:
#         raise HTTPException(status_code=400, detail="Invalid plan")
    
#     amount = plan_prices[checkout_req.plan_name]
#     origin_url = checkout_req.origin_url
    
#     if not origin_url:
#         raise HTTPException(status_code=400, detail="origin_url required")
    
#     # Create Stripe checkout
#     host_url = str(request.base_url)
#     webhook_url = f"{host_url}api/webhook/stripe"
#     stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
#     success_url = f"{origin_url}/billing/success?session_id={{{{CHECKOUT_SESSION_ID}}}}"
#     cancel_url = f"{origin_url}/billing"
    
#     checkout_request = CheckoutSessionRequest(
#         amount=amount,
#         currency="usd",
#         success_url=success_url,
#         cancel_url=cancel_url,
#         metadata={
#             "user_id": user["user_id"],
#             "plan_name": checkout_req.plan_name
#         }
#     )
    
#     session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
#     # Store transaction
#     transaction_doc = {
#         "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
#         "user_id": user["user_id"],
#         "session_id": session.session_id,
#         "plan_name": checkout_req.plan_name,
#         "amount": amount,
#         "currency": "usd",
#         "payment_status": "pending",
#         "created_at": datetime.now(timezone.utc).isoformat()
#     }
#     await db.payment_transactions.insert_one(transaction_doc)
    
#     return {"url": session.url, "session_id": session.session_id}

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


# @api_router.get("/billing/status/{session_id}")
# async def get_checkout_status(session_id: str, user: dict = Depends(get_current_user)):
#     """Get checkout session status"""
#     stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    
#     status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
#     # Update transaction if paid
#     if status.payment_status == "paid":
#         transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
#         if transaction and transaction.get("payment_status") != "paid":
#             # Update user plan
#             await db.users.update_one(
#                 {"user_id": user["user_id"]},
#                 {"$set": {"plan": transaction["plan_name"]}}
#             )
            
#             # Update transaction
#             await db.payment_transactions.update_one(
#                 {"session_id": session_id},
#                 {"$set": {"payment_status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
#             )
    
#     return {
#         "status": status.status,
#         "payment_status": status.payment_status,
#         "amount": status.amount_total / 100,  # Convert cents to dollars
#         "currency": status.currency
#     }

@api_router.get("/billing/status/{session_id}")
async def checkout_status(
    session_id: str,
    user: dict = Depends(get_current_user)
):
    session = stripe.checkout.Session.retrieve(session_id)

    if session.payment_status == "paid":
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": {"plan": session.metadata["plan_name"]}}
        )

        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": "paid",
                "paid_at": datetime.now(timezone.utc).isoformat()
            }}
        )

    return {
        "status": session.status,
        "payment_status": session.payment_status
    }


# @api_router.post("/webhook/stripe")
# async def stripe_webhook(request: Request):
#     """Handle Stripe webhooks"""
#     body = await request.body()
#     signature = request.headers.get("Stripe-Signature")
    
#     stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    
#     try:
#         webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
#         if webhook_response.event_type == "checkout.session.completed":
#             session_id = webhook_response.session_id
#             metadata = webhook_response.metadata
            
#             # Update transaction
#             await db.payment_transactions.update_one(
#                 {"session_id": session_id},
#                 {"$set": {"payment_status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
#             )
            
#             # Update user plan
#             if metadata and "user_id" in metadata and "plan_name" in metadata:
#                 await db.users.update_one(
#                     {"user_id": metadata["user_id"]},
#                     {"$set": {"plan": metadata["plan_name"]}}
#                 )
        
#         return {"status": "success"}
#     except Exception as e:
#         logger.error(f"Webhook error: {e}")
#         raise HTTPException(status_code=400, detail="Webhook processing failed")

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

        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"plan": plan}}
        )

    return {"status": "success"}

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
