const Booking = require("../models/booking.modal");
const Service = require("../models/services.model");
const Shop = require("../models/shop.modal");
const mongoose = require("mongoose");

    async function bookingController(req, res) {
        const { customerName, phone,email, serviceIds, startAt } = req.body;

        try {
            const shop = await Shop.findOne();
            if (!shop) return res.status(500).json({ message: "Shop settings nahi milin." });

            // --- 1. EMERGENCY LOCK (isClosed) ---
            // Agar admin ne button off kiya hai, toh custom message dikhao
            if (shop.isClosed) {    
                return res.status(400).json({
                    success: false,
                    message: shop.emergencyMessage
                });
            }

            const bookingDate = new Date(startAt);
            const now = new Date();

            // --- 2. PAST TIME CHECK ---
            if (bookingDate < now) {
                return res.status(400).json({ message: "Guzray huway waqt ki booking nahi ho sakti." });
            }

            // --- 3. SPECIFIC DATE OFF CHECK ---
            

            // --- 4. ADVANCE BOOKING LIMIT (1 Week) ---
            const oneWeekLimit = new Date();
            oneWeekLimit.setDate(now.getDate() + 7);
            if (bookingDate > oneWeekLimit) {
                return res.status(400).json({ message: "Aap sirf 1 hafta pehle tak ki booking kar sakte hain." });
            }

            // --- 5. DURATION & OVERLAP LOGIC ---
            const selectedServices = await Service.find({ _id: { $in: serviceIds } });
            const duration = selectedServices.reduce((acc, s) => acc + s.duration, 0);
            const totalPrice = selectedServices.reduce((acc, s) => acc + s.price, 0);
            const endTime = new Date(bookingDate.getTime() + duration * 60000);

            // --- 6. SHOP TIMING CHECK ---
            const startHour = bookingDate.getHours();
            const endHour = endTime.getHours();
            if (startHour < shop.openTime || endHour >= shop.closeTime) {
                return res.status(400).json({ message: `Shop timings subah ${shop.openTime}:00 se raat ${shop.closeTime}:00 tak hain.` });
            }

            // --- 7. SHOP OVERLAP CHECK ---
            const existingBooking = await Booking.findOne({
                status: { $ne: "cancelled" },
                $or: [{ startAt: { $lt: endTime }, endAt: { $gt: bookingDate } }]
            });

            if (existingBooking) {
                return res.status(400).json({ message: "Shop is waqt busy hai ya selected service ka waqt exceed kar raha hai." });
            }

            // --- 8. SUCCESS: CREATE BOOKING ---
            const newBooking = await Booking.create({
                customerName, phone,email, serviceIds,
                startAt: bookingDate, endAt: endTime, totalPrice
            });

            res.status(201).json({ success: true, data: newBooking });

        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }


const updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }
    if (!status) {
        return res.status(400).json({ message: "Status field is required" });
    }
    try {
        const booking = await Booking.findByIdAndUpdate(
            id, 
            { status }, 
            { returnDocument: 'after', runValidators: true }
        );
        
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(200).json({ message: "Booking status updated successfully", booking });
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getAllbookings = async (req, res) => {
    try {
        const allBookings = await Booking.find({});
        res.status(200).json({
            message: "fetching booking successfully", bookings: allBookings
        })
    } catch (error) {
        console.log("error during fetching booking", error);
        return res.status(400).json({
            message: "An error occur during fetching booking"
        })
    }
}

const removeBooking = async (req,res) => {
    const {id} = req.params;
    if(!id){
        return res.status(400).json({message:"Please provide booking id"});
    }
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"Invalid ID format"});
    }
    try {
        const booking = await Booking.findByIdAndDelete(id);
        res.status(200).json({message:"Booking deleted successfully", booking});
    } catch (error) {
        res.status(500).json({message:"Error deleting booking"});
    }
}


const getPendingBookings = async (req,res) => {
    try {
        const pendingBookings = await Booking.find({status:"pending"});
        res.status(200).json({
            message:"fetching pending bookings successfully", bookings: pendingBookings
        })
    } catch (error) {
        console.log("error during fetching pending bookings", error);
        return res.status(400).json({
            message:"An error occur during fetching pending bookings"
        })
    }   
}

const getCompletedBookings = async (req,res) => {
    try {
        const completedBookings = await Booking.find({status:"completed"});
        res.status(200).json({
            message:"fetching completed bookings successfully", bookings: completedBookings
        })
    } catch (error) {
        console.log("error during fetching completed bookings", error);
        return res.status(400).json({
            message:"An error occur during fetching completed bookings"
        })
    }   
}

const getCancelledBookings = async (req,res) => {
    try {
        const cancelledBookings = await Booking.find({status:"cancelled"});
        res.status(200).json({
            message:"fetching cancelled bookings successfully", bookings: cancelledBookings
        })
    } catch (error) {
        console.log("error during fetching cancelled bookings", error);
        return res.status(400).json({
            message:"An error occur during fetching cancelled bookings"
        })
    }   
}

const getConfirmedBookings = async (req,res) => {
    try {
        const confirmedBookings = await Booking.find({status:"confirmed"});
        res.status(200).json({
            message:"fetching confirmed bookings successfully", bookings: confirmedBookings
        })
    } catch (error) {
        console.log("error during fetching confirmed bookings", error);
        return res.status(400).json({
            message:"An error occur during fetching confirmed bookings"
        })
    }   
}




const getReminders = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Find the latest booking for each unique email
        // and check if it was completed more than 30 days ago
        const latestBookings = await Booking.aggregate([
            { $sort: { startAt: -1 } },
            {
                $group: {
                    _id: "$email",
                    latestBooking: { $first: "$$ROOT" }
                }
            },
            {
                $match: {
                    "latestBooking.status": "completed",
                    "latestBooking.startAt": { $lte: thirtyDaysAgo }
                }
            }
        ]);

        const reminders = latestBookings.map(item => item.latestBooking);

        res.status(200).json({
            message: "Reminders fetched successfully",
            reminders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getMyBookings = async (req, res) => {
    try {
        const myBookings = await Booking.find({ email: req.user.email }).sort({ startAt: -1 });
        res.status(200).json({
            success: true,
            bookings: myBookings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const cancelMyBooking = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }
    try {
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        // Only allow the owner to delete their booking
        if (booking.email !== req.user.email) {
            return res.status(403).json({ message: "You can only delete your own bookings" });
        }
        await Booking.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Booking cancelled and removed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error cancelling booking" });
    }
};

const removeAllBookings = async (req, res) => {
    try {
        await Booking.deleteMany({});
        res.status(200).json({ success: true, message: "All bookings deleted successfully" });
    } catch (error) {
        console.error("Error deleting all bookings:", error);
        res.status(500).json({ success: false, message: "Error deleting all bookings" });
    }
}

module.exports = { bookingController, updateBookingStatus, getAllbookings, getPendingBookings, getCompletedBookings, getCancelledBookings, getConfirmedBookings, removeBooking, getReminders, getMyBookings, cancelMyBooking, removeAllBookings };
