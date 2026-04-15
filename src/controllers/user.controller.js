const User = require("../models/user.modal");
const Booking = require("../models/booking.modal");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }
    try {
        const alreadyExists = await User.findOne({ email }).select("+password");
        if (alreadyExists) {
            return res.status(400).json({ message: "User with this email already exists" });
        }
        const newUSer = await User.create({ username, email, password });
        const token = jwt.sign({ id: newUSer._id }, process.env.JWT_SECRET);
        res.cookie("token", token);
        res.status(201).json({
            message: "User registered successfully", user: {
                _id: newUSer._id,
                username: newUSer.username,
                email: newUSer.email,
                role: newUSer.role
            }, token
        });

         
    } catch (error) {
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map(e => e.message).join(", ");
            return res.status(400).json({ message });
        } 
        if (error.code === 11000) {
            return res.status(400).json({ message: "User with this email already exists" });
        }
        console.error("Registration Error:", error);
        return res.status(500).json({ message: "Internal server error during registration" });
    }

}

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" });
    }
    try {
        const isUser = await User.findOne({ email }).select("+password");
        if (!isUser) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isUserValid = await isUser.comparePassword(password);
        if (!isUserValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign({ id: isUser._id }, process.env.JWT_SECRET);
        res.cookie("token", token);
        res.status(200).json({
            message: "Login successful", user: {
                _id: isUser._id,
                username: isUser.username,
                email: isUser.email,
                role: isUser.role
            }, token
        });

         

    } catch (error) {
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map(e => e.message).join(", ");
            return res.status(400).json({ message });
        }
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Internal server error during login" });
    }

}


const removeCustomer = async (req,res) => {
    const {id} = req.params;
    if(!id){
        return res.status(400).json({message:"Please provide customer id"});
    }
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"Invalid ID format"});
    }
    try {
        const userToCheck = await User.findById(id);
        if (!userToCheck) {
            return res.status(404).json({message:"Customer not found"});
        }
        if (userToCheck.role === 'admin') {
            return res.status(403).json({message:"Admin users cannot be deleted."});
        }
        // Cascade delete: remove all bookings linked to this user's email
        await Booking.deleteMany({ email: userToCheck.email });
        const customer = await User.findByIdAndDelete(id);
        res.status(200).json({message:"Customer and their bookings deleted successfully", customer});
    } catch (error) {
        res.status(500).json({message:"Error deleting customer"});
    }
}

const getAllUsers = async (req, res) => {
    try {
        const query = req.user ? { _id: { $ne: req.user._id } } : {};
        const users = await User.find(query);
        res.status(200).json({
            message: "Users fetched successfully",
            users
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!id || !role) {
        return res.status(400).json({ message: "Please provide user id and role" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }
    if (!["customer", "admin", "barber"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
    }

    try {
        const userToUpdate = await User.findById(id);
        if (!userToUpdate) {
            return res.status(404).json({ message: "User not found" });
        }
        if (userToUpdate.isPrimary) {
            return res.status(403).json({ message: "Primary admin cannot be demoted or modified." });
        }

        userToUpdate.role = role;
        await userToUpdate.save();

        res.status(200).json({ message: `User role updated to ${role}`, user: userToUpdate });
    } catch (error) {
        res.status(500).json({ message: "Error updating user role" });
    }
}

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Server error fetching profile" });
    }
}

const updateProfile = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (password) user.password = password;

        await user.save();
        
        const updatedUser = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "A user with this email already exists" });
        }
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map(e => e.message).join(", ");
            return res.status(400).json({ message });
        }
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Server error updating profile" });
    }
}

module.exports = {
    register,
    login,
    removeCustomer,
    getAllUsers,
    updateUserRole,
    getUserProfile,
    updateProfile
}
