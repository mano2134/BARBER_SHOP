const Shop = require("../models/shop.modal");
const Service = require("../models/services.model");
const mongoose = require("mongoose");
const UploadShopData = async (req, res) => {
    try {
        const { 
            shopName,landingHeading, openTime, closeTime, minNoticeTime, maxAdvanceDays, offDates, isClosed, emergencyMessage 
        } = req.body;


        // 1. Sirf un fields ko check karo jo waqai zaroori hain
        // isClosed aur offDates ko yahan check na karo kyunki wo false ya empty ho sakte hain
        if (!shopName || openTime === undefined || closeTime === undefined) {
            return res.status(400).json({ message: "Shop name aur timings lazmi hain." });
        }

        // 2. findOneAndUpdate logic (Single Document)
        // {} khali object ka matlab hai pehla document dhoondo
        // upsert: true ka matlab hai agar nahi hai toh bana do
        const shop = await Shop.findOneAndUpdate(
            {}, 
            {
                shopName,
                landingHeading,
                openTime,
                closeTime,
                minNoticeTime,
                maxAdvanceDays,
                offDates,
                isClosed,
                emergencyMessage
            },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );

        res.status(200).json({
            message: "Shop settings updated successfully",
            shop
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getShopData = async (req, res) => {
    try {
        const shop = await Shop.findOne();
        res.status(200).json({
            message: "Shop data fetched successfully",
            shop
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateShop = async (req,res) => {
    const {id} = req.params;
    if(!id){
        return res.status(400).json({message:"Please provide shop id"});
    }
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"Invalid ID format"});
    }
    try {
        const shop = await Shop.findByIdAndUpdate({_id:id},req.body,{returnDocument: 'after'});
        res.status(200).json({message:"Shop updated successfully", shop});
    } catch (error) {
        res.status(500).json({message:"Error updating shop"});
    }
}


const getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json({
            message: "Services fetched successfully",
            services
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {UploadShopData,getShopData,updateShop,getAllServices};