const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const moment = require('moment');

exports.getAll = (Model, option = {}) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (option?.path) {
      filter = constructFilter(option.path, req, next);
    }

    let ref = option?.ref || '';

    const features = new APIFeatures(
      Model.find(filter).populate(ref),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    res
      .status(200)
      .json({ status: 'success', results: docs.length, data: docs });
  });

exports.getOne = (Model, option = {}) =>
  catchAsync(async (req, res, next) => {
    let ref = option?.ref || '';

    const doc = await Model.findById(req.params.id).populate(ref);

    if (!doc) return next(new AppError('No document with that ID exists', 400));

    res.status(200).json({ status: 'success', data: doc });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({ status: 'success', data: newDoc });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoc)
      return next(new AppError('No document with that ID exists', 400));

    res.status(200).json({ status: 'success', data: updatedDoc });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError('No document with that ID exists', 400));

    res.status(200).json({ status: 'success' });
  });

const constructFilter = (path, req, next) => {
  switch (path) {
    case 'upcoming':
      const currentDate = new Date().toISOString();
      return {
        'startDates.0': {
          $gte: currentDate,
          $lte: moment(currentDate).add(3, 'months'),
        },
      };

    case 'tours-within':
      const { distance, latlng, unit } = req.params;

      const [lat, lng] = latlng.split(',');

      const earthRadiusInMiles = 3963.2;
      const earthRadiusInKm = 6378.1;
      const radians =
        unit === 'mi'
          ? distance / earthRadiusInMiles
          : distance / earthRadiusInKm;

      if (!lat || !lng) {
        return next(
          new AppError(
            'Please provide latitude and longitude in the format lat,lng.'
          )
        );
      }

      return {
        mainLocation: { $geoWithin: { $centerSphere: [[lng, lat], radians] } },
      };

    default:
      return;
  }
};
