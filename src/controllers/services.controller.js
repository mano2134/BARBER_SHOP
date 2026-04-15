const Service = require("../models/services.model");
const mongoose = require("mongoose");

const addService = async (req,res) => {
    const {serviceName, duration, price, description} = req.body;
    if(!serviceName || !duration || !price){
        return res.status(400).json({message:"Please provide all required fields"});
    }
    try {
        const newService =await Service.create({
            serviceName,
            duration,
            price,
            description
        })
        res.status(201).json({message:"Service added successfully", service: newService});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"});
    }

}

const removeService = async (req,res) => {
    const {id} = req.params;
    if(!id){
        return res.status(400).json({message:"Please provide service id"});
    }
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"Invalid ID format"});
    }
    try {
        const service = await Service.findByIdAndDelete(id);
        res.status(200).json({message:"Service deleted successfully", service});
    } catch (error) {
        res.status(500).json({message:"Error deleting service"});
    }
}

const updateService = async (req,res) => {
    const {id} = req.params;
    if(!id){
        return res.status(400).json({message:"Please provide service id"});
    }
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"Invalid ID format"});
    }
    try {
        const service = await Service.findByIdAndUpdate({_id:id},req.body,{returnDocument: 'after',runValidators:true});
        res.status(200).json({message:"Service updated successfully", service});
    } catch (error) {
        res.status(500).json({message:"Error updating service"});
    }
}

module.exports = {addService,removeService,updateService};