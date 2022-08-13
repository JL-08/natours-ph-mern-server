const mongoose = require('mongoose');
const { schema } = require('./userModel');

const refreshTokenSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    token: String,
    expiresAt: Date,
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    createdByIp: String,
    revokedAt: Date,
    revokedByIp: String,
    replacedByToken: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

schema.virtual('isExpired').get(() => {
  return this.expires <= Date.now();
});

schema.virtual('isActive').get(() => {
  return !this.revokedAt && !this.isExpired;
});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
