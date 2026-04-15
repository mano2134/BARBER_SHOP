const {Router} = require("express");
const { addService, removeService, updateService } = require("../controllers/services.controller");
const {authUser,authAdmin} = require("../middleware/auth.middlware");
const { updateBookingStatus, getAllbookings, removeBooking, getPendingBookings, getCompletedBookings, getCancelledBookings, getConfirmedBookings, getReminders, removeAllBookings } = require("../controllers/booking.controller");

const {UploadShopData, updateShop} = require("../controllers/shop.controller");
const { removeCustomer, getAllUsers, updateUserRole } = require("../controllers/user.controller");
const { addPortfolio, deletePortfolio, upload } = require("../controllers/portfolio.controller");
const adminRouter = Router();

adminRouter.get("/all-customers", authUser, authAdmin, getAllUsers);

/**
 *all POST methods
 */
adminRouter.post("/service",authUser,authAdmin,addService);
adminRouter.post("/upload-shop-data",authUser,authAdmin,UploadShopData);
adminRouter.post("/portfolio", authUser, authAdmin, upload.fields([{ name: 'before', maxCount: 1 }, { name: 'after', maxCount: 1 }]), addPortfolio);
/**
 * all update methods
 */
adminRouter.patch("/update-booking-status/:id",authUser,authAdmin,updateBookingStatus);

adminRouter.patch("/update-service/:id",authUser,authAdmin,updateService);
adminRouter.patch("/update-shop/:id",authUser,authAdmin,updateShop);
adminRouter.patch("/update-booking/:id",authUser,authAdmin,updateBookingStatus);
adminRouter.patch("/update-role/:id",authUser,authAdmin,updateUserRole);
/**
 * all delete method
 */

adminRouter.delete("/remove-service/:id",authUser,authAdmin,removeService);
adminRouter.delete("/remove-customer/:id",authUser,authAdmin,removeCustomer);
adminRouter.delete("/remove-booking/:id",authUser,authAdmin,removeBooking);
adminRouter.delete("/remove-all-bookings", authUser, authAdmin, removeAllBookings);
adminRouter.delete("/portfolio/:id", authUser, authAdmin, deletePortfolio);

/**
 * all get methods
 */
adminRouter.get("/all-bookings",authUser,authAdmin,getAllbookings);
adminRouter.get("/pending-bookings",authUser,authAdmin,getPendingBookings);
adminRouter.get("/completed-bookings",authUser,authAdmin,getCompletedBookings);
adminRouter.get("/confirmed-bookings",authUser,authAdmin,getConfirmedBookings);
adminRouter.get("/reminders", authUser, authAdmin, getReminders);



module.exports = adminRouter;