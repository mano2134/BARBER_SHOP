const {Router} = require("express");
const { bookingController, getMyBookings, cancelMyBooking } = require("../controllers/booking.controller");
const {authUser} = require("../middleware/auth.middlware");
const cutomerRouter = Router();


cutomerRouter.post("/",authUser,bookingController);
cutomerRouter.get("/my-bookings", authUser, getMyBookings);
cutomerRouter.delete("/cancel/:id", authUser, cancelMyBooking);


module.exports = cutomerRouter;