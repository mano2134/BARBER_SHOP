const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
    shopName: { type: String, required: true, default: "Elite Barber Shop" },
    landingHeading: { type: String, default: "Apna Style Behtar Banayein" },
    
    openTime: { type: Number, default: 10 }, 
    closeTime: { type: Number, default: 22 },
    
    // Barber ke samajhne ke liye rules
    minNoticeTime: { type: Number, default: 20 },  // 1 ghanta pehle booking band
    maxAdvanceDays: { type: Number, default: 30 }, // Kitne din aage tak booking khuli hai
    
    offDates: { type: [Date], default: [] },
    
    isClosed: { type: Boolean, default: false },
    emergencyMessage: { type: String, default: "Shop aaj band hai." }
}, { timestamps: true });

const Shop = mongoose.model("Shop", shopSchema);
module.exports = Shop;