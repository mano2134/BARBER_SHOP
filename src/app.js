const express= require("express");
require("dotenv").config();
const connectDB = require("./config/db.js");
const app= express();
const cookieParser = require("cookie-parser");
const cors = require("cors")
app.use(cookieParser());
app.use(express.json());
app.use(cors());
connectDB();

/**
 * get routes
 */
const authRouter = require("./routes/auth.routes.js");
const bookingRouter = require("./routes/cutomerRouter.routes.js");
const adminRouter = require("./routes/admin.routes.js");
const Booking = require("./models/booking.modal.js");
const Service = require("./models/services.model.js");
const shopRouter = require("./routes/shop.routes.js");
const User = require("./models/user.modal.js");


/**
 * use routes
 */
app.use("/api/auth",authRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/admin",adminRouter);
app.use("/api/shop",shopRouter);
// app.get("/",async(req,res)=>{
//     const user = await User.find({});
//     res.status(200).json({message:"Welcome to the Barber Shop API",user});
// })
module.exports= app;

