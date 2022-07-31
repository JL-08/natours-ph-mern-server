const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  status: {
    type: String,
    enum: ['pending', 'payed', 'failed'],
  },
  tour: {
    type: mongoose.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'A booking must have a tour'],
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'A booking must have a user'],
  },
  price: {
    type: Number,
    required: [true, 'A booking must have a price'],
  },
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
