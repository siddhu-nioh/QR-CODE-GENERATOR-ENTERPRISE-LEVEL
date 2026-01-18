# Here are your Instructions


Live Project : https://qr-code-generator-enterprise-level.vercel.app



# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


# QR Code Generator – Backend (FastAPI)

This is the **backend service** for the QR Code Generator Enterprise-Level application.  
It is built using **FastAPI**, connects to **MongoDB**, and integrates **Stripe** for payments.

The backend is deployed on **Render** and exposes a REST API consumed by the frontend.

---

## 🚀 Tech Stack

- **FastAPI** – API framework
- **Uvicorn** – ASGI server
- **MongoDB Atlas** – Database
- **Stripe** – Payments & subscriptions
- **JWT** – Authentication
- **Python 3.11+**

---

## 📂 Project Structure

backend/
├── server.py # Main FastAPI app
├── requirements.txt # Python dependencies
├── .env # Environment variables (not committed)
└── README.md


---

## 🔐 Environment Variables

Create a `.env` file inside `backend/`:

```env
MONGO_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/qrcode
DB_NAME=qrcode

JWT_SECRET=your_jwt_secret

STRIPE_API_KEY=sk_test_********
STRIPE_WEBHOOK_SECRET=whsec_********

CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
🧪 Run Locally
1️⃣ Create virtual environment
python -m venv venv

2️⃣ Activate venv

Windows

venv\Scripts\activate


macOS / Linux

source venv/bin/activate

3️⃣ Install dependencies
pip install -r requirements.txt

4️⃣ Start server
uvicorn server:app --reload


Backend will run at:

http://127.0.0.1:8000


Swagger Docs:

http://127.0.0.1:8000/docs

💳 Stripe Webhooks
Local (using Stripe CLI)
stripe login
stripe listen --forward-to localhost:8000/api/webhook/stripe


Use the generated whsec_... in .env.

Production

Configure webhook in Stripe Dashboard

Endpoint:

https://<render-backend-url>/api/webhook/stripe
