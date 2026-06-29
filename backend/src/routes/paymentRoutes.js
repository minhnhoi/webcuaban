const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');

// Catalog & ví
router.get('/packages', ctrl.listPackages);
router.get('/wallet', requireAuth, ctrl.getWallet);
router.get('/history', requireAuth, ctrl.listHistory);

// Đơn hàng
router.post('/order', requireAuth, ctrl.createOrder);
router.post('/order/confirm', requireAuth, ctrl.confirmOrder);
router.post('/order/verify', requireAuth, ctrl.verifyOrder); // <-- mới: dùng cho /success
router.post('/order/cancel', requireAuth, ctrl.cancelOrder);
router.get('/order/:orderId/qr', requireAuth, ctrl.getPaymentQR);

// Webhook PayOS (public, không auth)
router.post('/webhook/payos', ctrl.webhookPayOS);

module.exports = router;
