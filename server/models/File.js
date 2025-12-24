const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    // --- 🟢 EXISTING FIELDS (Purane wale - No Change) ---
    originalName: String,
    cloudinaryUrl: String,
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
    // Agar user kuch select nahi karta, to Default 'GHOST' rahega.
    watermarkType: { type: String, default: 'GHOST' }, 

    // --- 💀 AUTO-DELETE LOGIC (Snapchat Style) ---
    expireAt: { 
        type: Date, 
        index: { expires: '0s' } 
    } 
});

module.exports = mongoose.model('File', FileSchema);