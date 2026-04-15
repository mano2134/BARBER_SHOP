const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    serviceName:{
        type:String,
        require:true,

    },
    duration:{
        type:Number,
        require:true,
    },
    price:{
        type:Number,
        require:true,
    },
    description:{
        type:String,
    },
})

const Service = mongoose.model("Service",serviceSchema);

module.exports = Service;