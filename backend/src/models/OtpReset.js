const mongoose = require('mongoose');

const otpResetSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true },
  used: { type: Boolean, default: false },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('OtpReset', otpResetSchema);
