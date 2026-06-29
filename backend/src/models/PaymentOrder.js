const mongoose = require('mongoose');

const paymentOrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orderCode: { type: String, required: true, unique: true },
  // PayOS bắt buộc orderCode là số; lưu mapping để webhook tìm đúng đơn.
  payosOrderCode: { type: Number, unique: true, sparse: true, index: true },
  paymentLinkId: { type: String, default: '' },
  checkoutUrl: { type: String, default: '' },
  packageId: { type: String, required: true },
  packageType: { type: String, enum: ['coin', 'gem', 'promo'], required: true },
  amount: { type: Number, required: true },          // VND
  coinReward: { type: Number, default: 0 },
  gemReward: { type: Number, default: 0 },
  bonusNote: { type: String, default: '' },
  method: { type: String, required: true },          // bank | momo | zalopay | vnpay | card | atm | telco
  methodDetail: { type: Object, default: {} },       // bank name, telco provider, last4...
  status: { type: String, enum: ['pending', 'success', 'failed', 'cancelled'], default: 'pending', index: true },
  paidAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('PaymentOrder', paymentOrderSchema);
