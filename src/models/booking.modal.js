const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Naam likhna zaroori hai'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number zaroori hai'],
    
  },

  email: {
    type: String,
    required: [true, "Email lazmi hai taake notification bheji ja sakay"]
  },

  serviceIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Service',
    required: [true, 'Kam ki details zaroori hai']
  },

  startAt: {
    type: Date,
    required: [true, 'Start time zaroori hai']
  },

  endAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Special instructions should be less than 500 characters']
  },
  totalPrice: {
    type: Number,
    default: 0,
    min: [0, 'Total price cannot be negative']
  }

}, { timestamps: true });



const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
