const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, bookingController.getAllBookings)
  .post(authController.protect, bookingController.createBooking);

router
  .route('/:id')
  .get(authController.protect, bookingController.getBooking)
  .patch(authController.protect, bookingController.updateBooking);

module.exports = router;
