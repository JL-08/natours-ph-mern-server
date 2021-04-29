const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).json({ status: 'success', data: tours });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) return next(new AppError('No tour with that ID exists', 400));

  res.status(200).json({ status: 'success', data: tour });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({ status: 'success', data: newTour });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTour)
    return next(new AppError('No tour with that ID exists', 400));

  res.status(200).json({ status: 'success', data: updatedTour });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) return next(new AppError('No tour with that ID exists', 400));

  res.status(200).json({ status: 'success' });
});