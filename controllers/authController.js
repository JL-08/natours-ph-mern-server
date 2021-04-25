const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');

const User = require('../models/userModel');

const createSendToken = (user, statusCode, res) => {
  const token = jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

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

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ message: 'Please fill all required fields.' });

  const user = await User.findOne({ email }).select('+password');

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect)
    return res.status(400).json({ message: 'Invalid credentials' });

  createSendToken(user, 200, res);
});

// exports.test = (req, res, next) => {
//   res.status(200).json({ message: 'works' });
// };

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('bearer')
  )
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return res
      .status(400)
      .json({ message: 'You are not logged in. Please login to get access.' });

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log('decoded', decoded);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser)
    return res
      .status(400)
      .json({ message: 'The token belonging to this user no longer exists.' });

  req.user = currentUser;
  next();
});
