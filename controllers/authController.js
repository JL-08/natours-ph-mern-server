const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const { promisify } = require('util');

const User = require('../models/userModel');
const RefreshToken = require('../models/refreshTokenModel');

const generateJwtToken = (user) => {
  const token = jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  return token;
};

const createRefreshToken = async (req, user, session) => {
  const token = jwt.sign(
    { email: user.email, id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    }
  );

  const expiresAt = moment(Date.now()).add(7, 'days');

  await RefreshToken.create(
    [
      {
        user: user._id,
        token,
        expiresAt,
        createdByIp: req.ip || null,
      },
    ],
    { session }
  );

  return {
    token,
    expiresAt,
  };
};

const setTokenCookie = (res, token, expiresAt) => {
  const cookieOptions = {
    httpOnly: true,
    expires: moment(expiresAt).toDate(),
  };
  res.cookie('refreshToken', token, cookieOptions);
};

const decodeTokens = async (res, token, refreshToken) => {
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    await promisify(jwt.verify)(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    return decoded;
  } catch (error) {
    return;
  }
};

exports.register = catchAsync(async (req, res, next) => {
  const { email, password, passwordConfirm } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser)
    return res.status(400).json({ message: 'User already exist.' });

  if (password !== passwordConfirm)
    return res.status(400).json({ message: "Password don't match." });

  const session = await mongoose.startSession();
  await session.startTransaction();

  try {
    const newUser = await User.create([req.body], { session });

    const token = generateJwtToken(newUser);
    const refreshToken = await createRefreshToken(req, newUser, session);

    setTokenCookie(res, refreshToken.token, refreshToken.expiresAt);

    await session.commitTransaction();

    res.status(201).json({
      status: 'success',
      token,
      refreshToken: refreshToken.token,
      data: {
        newUser,
      },
    });
  } catch (error) {
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log('Cookies: ', req.cookies);
  if (!email || !password)
    return res
      .status(400)
      .json({ message: 'Please fill all required fields.' });

  const user = await User.findOne({ email }).select('+password');

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect)
    return res.status(400).json({ message: 'Invalid credentials' });

  const token = generateJwtToken(user);
  const refreshToken = createRefreshToken(req, user, null);

  setTokenCookie(res, refreshToken.token, refreshToken.expiresAt);

  res.status(200).json({
    status: 'success',
    token,
    refreshToken: refreshToken.token,
    data: {
      user,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  const { refreshToken } = req?.cookies;
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  )
    token = req.headers.authorization.split(' ')[1];

  console.log('Cookies: ', req.cookies);

  if (!token && refreshToken)
    return res
      .status(401)
      .json({ message: 'Requesting for a new access token...' });

  if (!refreshToken || (!token && !refreshToken))
    return res
      .status(401)
      .json({ message: 'You are not logged in. Please login to get access.' });

  const isCustomAuth = token.length < 500;

  if (!isCustomAuth) {
    const decoded = jwt.decode(token);
    req.userId = decoded.sub;
  } else {
    const decoded = await decodeTokens(res, token, refreshToken);

    if (!decoded)
      return res.status(401).json({ message: 'Invalid token credentials.' });

    const currentUser = await User.findById(decoded.id);

    if (!currentUser)
      return res.status(400).json({
        message: 'The token belonging to this user no longer exists.',
      });

    req.user = currentUser;
  }
  next();
});

exports.createToken = async (req, res) => {
  const { refreshToken } = req?.cookies;

  if (!refreshToken)
    return res
      .status(401)
      .json({ message: 'You are not logged in. Please login to get access.' });

  let decoded;
  try {
    decoded = await promisify(jwt.verify)(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token credentials.' });
  }

  const currentUser = await User.findById(decoded.id);

  if (!currentUser)
    return res.status(400).json({
      message: 'This user does not exist.',
    });

  const token = generateJwtToken({ email: decoded.email, _id: decoded.id });

  res.status(200).json({
    status: 'success',
    data: {
      token,
    },
  });
};

exports.getRefreshToken = catchAsync(async (req, res, next) => {});

exports.createRefresh = catchAsync(async (req, res, next) => {});

exports.revokeRefreshToken = catchAsync(async (req, res, next) => {});
