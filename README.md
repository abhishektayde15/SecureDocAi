# 🛡️ SecureDoc AI

A secure file-sharing web app designed for Cyber Cafes and Print Shops.

## 🚀 How to Run Locally

### 1. Download Code
```bash
git clone <YOUR_REPO_URL>
cd securedoc-ai

2. Setup Server (Backend)
cd server
npm install
  Create a .env file in server/ folder and add:
    PORT=5000
MONGO_URI=your_mongo_url
GEMINI_API_KEY=your_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloud_key
CLOUDINARY_API_SECRET=your_cloud_secret

3. Setup Client (Frontend)
cd client
npm install

Create a .env file in client/ folder and add your Firebase keys (starts with VITE_).

Run: npm run dev

