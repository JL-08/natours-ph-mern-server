const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour);

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  const earthRadiusInMiles = 3963.2;
  const earthRadiusInKm = 6378.1;
  const radians =
    unit === 'mi' ? distance / earthRadiusInMiles : distance / earthRadiusInKm;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.'
      )
    );
  }

  const tours = await Tour.find({
    mainLocation: { $geoWithin: { $centerSphere: [[lng, lat], radians] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours,
  });
});
