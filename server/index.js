require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const connectDB = require('./db');
const File = require('./models/File');
const Shop = require('./models/Shop');

// 👇 1. GOOGLE GEMINI IMPORT
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

connectDB();

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 👇 2. GEMINI CONFIGURATION
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'secure-doc-ai', resource_type: 'auto' },
});

const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. Upload API (Existing)
app.post('/api/upload', upload.array('files', 10), async (req, res) => {
    try {
        const { ownerId, ownerEmail, allowedAction, expiresIn, mode, shopId, senderName, watermarkType } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }
        
        const uploadedFiles = [];
        
        for (const file of req.files) {
            const expireDate = new Date(Date.now() + (parseInt(expiresIn) || 60) * 60000);

            const newFile = new File({
                originalName: file.originalname,
                cloudinaryUrl: file.path, 
                secureId: uuidv4(),
                ownerId,
                ownerEmail,
                allowedAction,
                expiresIn: parseInt(expiresIn) || 60,
                expireAt: expireDate,
                
                receiverShopId: mode === 'SHOP' ? shopId : null,
                senderName: senderName || 'User',
                watermarkType: watermarkType || 'GHOST'
            });

            await newFile.save();
            uploadedFiles.push(newFile);
        }

       if (mode === 'LINK') {
    
    res.json({ success: true, link: `https://docai-798b1.web.app/view/${uploadedFiles[0].secureId}` });
} else {
            res.json({ success: true, message: `Sent to ${shopId} successfully!` });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Verify Identity API (Existing)
app.post('/api/verify', async (req, res) => {
    try {
        const { secureId, name, snapshot } = req.body;
        const file = await File.findOne({ secureId });
        
        if (!file) return res.status(404).json({ message: 'Link Invalid or File Deleted' });

        if (new Date() > new Date(file.expireAt)) {
             return res.status(410).json({ message: 'Link Expired!' });
        }

        file.accessLogs.push({ accessedBy: name, snapshot });
        await file.save();

        res.json({ success: true, fileId: secureId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. View Document API (Existing)
app.get('/api/view/:secureId', async (req, res) => {
    try {
        const file = await File.findOne({ secureId: req.params.secureId });
        if (!file) return res.status(404).json({ message: 'File not found or Expired' });

        if (new Date() > new Date(file.expireAt)) {
            return res.status(410).json({ message: 'Link Expired!' });
       }

        res.json({ success: true, file });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Fetch Logs API (Existing)
app.get('/api/my-logs/:ownerId', async (req, res) => {
    try {
        const files = await File.find({ ownerId: req.params.ownerId }).sort({ createdAt: -1 });
        res.json({ success: true, files });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Create Shop ID (Existing)
app.post('/api/shop/create', async (req, res) => {
    try {
        const { ownerId, shopId, shopName } = req.body;
        const existing = await Shop.findOne({ shopId });
        if(existing) return res.status(400).json({ message: "Shop ID already taken" });

        const newShop = new Shop({ ownerId, shopId, shopName });
        await newShop.save();
        res.json({ success: true, shop: newShop });
    } catch (error) {
        res.status(500).json({ message: 'Shop Creation Failed' });
    }
});

// 6. Get My Shop (Existing)
app.get('/api/shop/me/:ownerId', async (req, res) => {
    try {
        const shop = await Shop.findOne({ ownerId: req.params.ownerId });
        res.json({ success: true, shop });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 7. Shop Polling (Existing)
app.get('/api/shop/files/:shopId', async (req, res) => {
    try {
        const files = await File.find({ 
            receiverShopId: req.params.shopId,
            expireAt: { $gt: new Date() } 
        }).sort({ createdAt: -1 });
        
        res.json({ success: true, files });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 🔥 8. NEW ROUTE: SMART AI WATCHDOG (Updated with Warning & Kill Switch)
// 🔥 ROUTE: RELAXED AI WATCHDOG (User Friendly Mode)
// ... baaki imports aur setup same rahenge ...

// 8. AI Watchdog (Security) - ROBUST ERROR HANDLING ADDED
app.post('/api/detect-anomaly', async (req, res) => {
    try {
        const { logs, secureId, violationCount } = req.body; 
        
        // Agar logs khali hain toh AI ko pareshan mat karo
        if (!logs || logs.length === 0) return res.json({ verdict: "SAFE" });

        // 🔥 USE STABLE MODEL (gemini-1.5-flash)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a security AI.
            Context: Attempt ${violationCount}. Actions: ${JSON.stringify(logs)}
            Rules:
            1. "Window Focus Lost", "Blur" -> IGNORE (Return "SAFE").
            2. "Right Click" -> If Attempt <= 3 Return "WARNING", else "TERMINATE".
            3. "PrintScreen", "Capture", "Snipping" -> ALWAYS "TERMINATE".
            
            Return JSON: { "verdict": "TERMINATE" or "WARNING" or "SAFE", "reason": "Message" }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, "").trim();
        const analysis = JSON.parse(text);

        if (analysis.verdict === "TERMINATE" && secureId) {
            console.log(`🚨 TERMINATING FILE: ${secureId}`);
            await File.findOneAndUpdate(
                { secureId }, 
                { 
                    expireAt: new Date(), 
                    $push: { accessLogs: { accessedBy: "Security AI", snapshot: `BLOCKED: ${analysis.reason}` } }
                }
            );
        }
        res.json(analysis);

    } catch (error) {
        // 🔥 ERROR HANDLING (Agar Quota khatam ho jaye toh crash mat hona)
        if (error.message.includes("429") || error.status === 429) {
            console.warn("⚠️ AI Quota Exceeded (429). Skipping AI check temporarily.");
            // Agar AI busy hai, toh user ko block mat karo, jaane do (Fail Safe)
            return res.json({ verdict: "SAFE" }); 
        }
        
        console.error("AI Service Error:", error.message);
        res.json({ verdict: "SAFE" }); 
    }
});

// ... baaki server listen code same rahega ...

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));