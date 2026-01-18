const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    // --- 🟢 EXISTING FIELDS (Purane wale - No Change) ---
    originalName: String,
    cloudinaryUrl: String,

    // 👇 CHANGE 1: Ye nayi line add ki hai (Cloudinary se delete karne ke liye ID)
    publicId: String,

    secureId: { type: String, unique: true },
    ownerId: String, // Clerk User ID
    ownerEmail: String,
    allowedAction: { type: String, enum: ['PRINT', 'DOWNLOAD'], default: 'PRINT' },
    
    // Logic check ke liye (API turant mana kar dega agar time over hua)
    expiresIn: { type: Number, required: true }, 

    accessLogs: [{
        accessedBy: String, 
        accessedAt: { type: Date, default: Date.now },
        snapshot: String
    }],

    createdAt: { type: Date, default: Date.now },
    
    // --- EXISTING SHOP FIELDS ---
    receiverShopId: { type: String, default: null }, // Kis Shop ID ko bheja gaya?
    senderName: { type: String, default: 'Anonymous' }, // Bhejne wale ka naam

    // 🔥 NEW FIELD ADDED: Watermark Type (GHOST or BOTTOM)
    watermarkType: { type: String, default: 'GHOST' }, 

    // --- 💀 AUTO-DELETE LOGIC (Snapchat Style) ---
    // 👇 CHANGE 2 & 3: Purana 'index: expires' wala code hata diya hai.
    // Ab ye sirf Date store karega. Delete karne ka kaam humara server (cron job) karega.
    expireAt: { type: Date } 
});

module.exports = mongoose.model('File', FileSchema);