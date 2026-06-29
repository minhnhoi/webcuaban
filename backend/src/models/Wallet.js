const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  coin: { type: Number, default: 0 },
  gem: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
