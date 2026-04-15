const {Router} = require("express");
const { register,login, getUserProfile, updateProfile } = require("../controllers/user.controller");
const {authUser} = require("../middleware/auth.middlware");
const authRouter = Router();

authRouter.post("/register",register);
authRouter.post("/login",login);
authRouter.get("/me", authUser, getUserProfile);
authRouter.patch("/updateProfile", authUser, updateProfile);

module.exports = authRouter;