const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const moment = require('moment');

exports.getAllTours = factory.getAll(Tour, {
  ref: 'guides',
});

exports.getTour = factory.getOne(Tour, {
  ref: 'guides',
});

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getUpcomingTours = factory.getAll(Tour, {
  path: 'upcoming',
});

exports.getToursWithin = factory.getAll(Tour, {
  path: 'tours-within',
});
