const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');

const createSendToken = (user, statusCode, res) => {
  const token = jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { email, password, passwordConfirm } = req.body;

  console.log(req.body);
  const existingUser = await User.findOne({ email });

  if (existingUser)
    return res.status(400).json({ message: 'User already exist.' });

  if (password !== passwordConfirm)
    return res.status(400).json({ message: "Password don't match." });

  const newUser = await User.create(req.body);

  createSendToken(newUser, 201, res);
});
