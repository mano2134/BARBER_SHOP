const jwt = require("jsonwebtoken");
const User = require("../models/user.modal");

const authUser = async(req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized, token missing" });
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user =await User.findById(decode.id);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized, user not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Unauthorized, invalid token" });
    }
}

    const authAdmin = (req, res, next) => {
        const user = req.user;
        try {
            if (!user) {
            return  res.status(500).json({
                    message: "Not allowed protected route"
                })
            }
            if (user.role !== "admin") {
            return  res.status(500).json({
                    message: "Not allowed protected route"
                })
            }
            next();
            
        } catch (error) {
            console.error("error is ",error);
        return res.status(404).json({
                message:"You are not an admin"
            })
        }
    }

    module.exports = {
        authUser,
        authAdmin
    };