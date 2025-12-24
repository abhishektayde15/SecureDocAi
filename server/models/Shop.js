const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
    ownerId: { type: String, required: true, unique: true }, // Clerk ID
    shopId: { type: String, required: true, unique: true }, // e.g. HERO-1
    shopName: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Shop', ShopSchema);