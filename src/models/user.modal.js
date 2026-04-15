const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    username: {
    type: String,
    required: [true, "username is required to create an account"],
    match: [/^[a-zA-Z0-9 ]+$/, "username should only contain letters, numbers or spaces"],
    minLength: [3, "username must be at least 3 characters long"],
    trim: true,
},
email: {
    type: String,
    required: [true, "email is required to create an account"],
    unique: true,
    match: [/.+\@.+\..+/, "please enter a valid email address"],
    trim: true,
},
password: {
    type: String,
    required: [true, "password is required to create an account"],
    minLength: [6, "password must be at least 6 characters long"],
    select: false,
},
role:{
    type: String,
    enum: ["customer", "barber", "admin"],
    default: "customer"
},
isPrimary: {
    type: Boolean,
    default: false
}
},{timestamps: true});


/**
 * Hash the password before saving the user to the database
 * This middleware runs before the 'save' operation on the user model
 */
userSchema.pre("save", async function() {
    if (!this.isModified("password")) return ;
    
    this.password = await bcrypt.hash(this.password, 10);
    
});
/**
 * Compare the entered password with the hashed password
 * This method can be used during login to verify the user's credentials
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
const User = mongoose.model("User", userSchema);

module.exports = User;