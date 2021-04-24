const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide your first name.'],
    trim: true,
    validate: [validator.isAlpha, 'Please provide a valid first name.'],
  },
  lastName: {
    type: String,
    required: [true, 'Please provide your last name.'],
    trim: true,
    validate: [validator.isAlpha, 'Please provide a valid last name.'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide your email.'],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email.'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'Please provide a password.'],
    minLength: [8, 'Password should be 8 characters or more.'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    trim: true,
    required: [true, 'Please confirm your password.'],
    validate: {
      // ONLY WORKS ON SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords does not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// hash the password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
