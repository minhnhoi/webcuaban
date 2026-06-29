// backend/src/controllers/paymentController.js
const { PayOS } = require('@payos/node');
const PaymentOrder = require('../models/PaymentOrder');
const Wallet = require('../models/Wallet');
const { findPackage, PACKAGES, PAYMENT_METHODS } = require('../services/packages');
const { generatePaymentQR } = require('../services/vietqr');

// ---------------- PayOS init ----------------
let payos = null;
if (process.env.PAYOS_CLIENT_ID && process.env.PAYOS_API_KEY && process.env.PAYOS_CHECKSUM_KEY) {
  try {
    payos = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID,
      apiKey: process.env.PAYOS_API_KEY,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY,
    });
  } catch (e) {
    console.error('PayOS init error:', e.message);
  }
}

// ---------------- Helpers ----------------
function genOrderCode() {
  return 'NAP' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

// PayOS yêu cầu orderCode là number và <= Number.MAX_SAFE_INTEGER.
function genPayosOrderCode() {
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return Number(`${Date.now()}${random}`);
}

function getFrontendBase(req) {
  return (process.env.FRONTEND_URL || req.get('origin') || 'http://localhost:5500').replace(/\/$/, '');
}

async function creditOrder(order) {
  if (!order || order.status === 'success') return null;

  order.status = 'success';
  order.paidAt = new Date();
  await order.save();

  return Wallet.findOneAndUpdate(
    { user: order.user },
    { $inc: { coin: order.coinReward, gem: order.gemReward }, $setOnInsert: { user: order.user } },
    { upsert: true, new: true }
  );
}

const BANK_INFO = {
  bankId: 'MB',
  accountNo: '0968278307',
  accountName: 'PHAM QUANG MINH',
};

// ---------------- Catalog & Wallet ----------------
exports.listPackages = (_req, res) => {
  res.json({ ok: true, packages: PACKAGES, methods: PAYMENT_METHODS });
};

exports.getWallet = async (req, res) => {
  const wallet = await Wallet.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { user: req.user._id } },
    { upsert: true, new: true }
  );
  res.json({ ok: true, wallet: { coin: wallet.coin, gem: wallet.gem } });
};

exports.listHistory = async (req, res) => {
  const orders = await PaymentOrder.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30);
  res.json({ ok: true, orders });
};

// ---------------- Create Order ----------------
exports.createOrder = async (req, res) => {
  try {
    const { packageId, method, methodDetail = {} } = req.body || {};
    const pkg = findPackage(packageId);
    if (!pkg) return res.status(400).json({ ok: false, message: 'Gói nạp không tồn tại' });
    if (!method) return res.status(400).json({ ok: false, message: 'Thiếu phương thức thanh toán' });

    const order = await PaymentOrder.create({
      user: req.user._id,
      orderCode: genOrderCode(),
      packageId: pkg.id,
      packageType: pkg.type,
      amount: pkg.amount,
      coinReward: pkg.coin || 0,
      gemReward: pkg.gem || 0,
      bonusNote: pkg.bonus || '',
      method,
      methodDetail,
      status: 'pending',
    });

    const instruction = {
      title: 'Hướng dẫn thanh toán',
      accountName: BANK_INFO.accountName,
      accountNo: BANK_INFO.accountNo,
      bankId: BANK_INFO.bankId,
      steps: [],
    };

    if (method === 'telco') {
      instruction.title = 'Nạp thẻ cào';
      instruction.note = 'Nhập đúng serial / mã thẻ rồi bấm "Tôi đã thanh toán" để gửi yêu cầu kiểm tra.';
      instruction.steps = [
        'Kiểm tra đúng nhà mạng và mệnh giá.',
        'Nhập serial và mã thẻ chính xác.',
        'Bấm "Tôi đã thanh toán" để gửi yêu cầu kiểm tra.',
      ];
      return res.json({ ok: true, order, instruction });
    }

    if (payos) {
      try {
        const frontendBase = getFrontendBase(req);
        const payosOrderCode = genPayosOrderCode();
        const link = await payos.paymentRequests.create({
          orderCode: payosOrderCode,
          amount: order.amount,
          description: `NAP ${order.orderCode}`.slice(0, 25),
          returnUrl: `${frontendBase}/success?orderCode=${order.orderCode}`,
          cancelUrl: `${frontendBase}/cancel?orderCode=${order.orderCode}`,
          items: [
            {
              name: pkg.name.slice(0, 25),
              quantity: 1,
              price: order.amount,
            },
          ],
        });

        order.payosOrderCode = payosOrderCode;
        order.paymentLinkId = link.paymentLinkId || '';
        order.checkoutUrl = link.checkoutUrl || '';
        await order.save();

        instruction.title = 'Thanh toán PayOS';
        instruction.checkoutUrl = link.checkoutUrl;
        instruction.qrText = link.qrCode;
        instruction.steps = [
          'Hệ thống sẽ chuyển bạn sang trang thanh toán PayOS.',
          'Quét mã QR bằng app ngân hàng và xác nhận chuyển khoản.',
          'Sau khi thanh toán thành công, ví sẽ được cộng tự động.',
        ];

        return res.json({ ok: true, order, instruction });
      } catch (e) {
        console.error('PayOS createPaymentLink error:', e.message);
        instruction.note = 'Không tạo được link PayOS, hệ thống chuyển sang hướng dẫn chuyển khoản ngân hàng.';
      }
    } else {
      instruction.note = 'PayOS chưa được cấu hình trên Render, hệ thống chuyển sang hướng dẫn chuyển khoản ngân hàng.';
    }

    if (method === 'bank' || method === 'atm' || method === 'vnpay' || method === 'momo' || method === 'zalopay' || method === 'card') {
      try {
        instruction.qrImage = await generatePaymentQR(order.amount, order.orderCode);
      } catch (e) {
        console.error('VietQR error:', e.message);
      }
      instruction.title = 'Chuyển khoản ngân hàng';
      instruction.steps = [
        'Mở ứng dụng ngân hàng và quét mã QR.',
        `Chuyển đúng số tiền ${order.amount.toLocaleString('vi-VN')}đ.`,
        `Nội dung chuyển khoản bắt buộc: ${order.orderCode}.`,
        'Sau khi chuyển khoản, bấm "Tôi đã thanh toán" để admin kiểm tra hoặc test cộng ví.',
      ];
    }

    res.json({ ok: true, order, instruction });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ ok: false, message: error.message || 'Tạo đơn thất bại' });
  }
};

// ---------------- Confirm Order (manual / sandbox) ----------------
exports.confirmOrder = async (req, res) => {
  try {
    const { orderCode } = req.body || {};
    const order = await PaymentOrder.findOne({ orderCode, user: req.user._id });
    if (!order) return res.status(404).json({ ok: false, message: 'Không tìm thấy đơn' });
    if (order.status === 'success') {
      const wallet = await Wallet.findOne({ user: req.user._id });
      return res.json({ ok: true, order, wallet: wallet || { coin: 0, gem: 0 } });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ ok: false, message: `Đơn đang ở trạng thái ${order.status}` });
    }

    const wallet = await creditOrder(order);
    res.json({ ok: true, order, wallet: { coin: wallet.coin, gem: wallet.gem } });
  } catch (e) {
    console.error('confirmOrder error:', e);
    res.status(500).json({ ok: false, message: e.message });
  }
};

// ---------------- Verify Order (sau khi PayOS redirect về /success) ----------------
// Không phụ thuộc webhook: gọi trực tiếp PayOS API để kiểm tra trạng thái và cộng ví.
exports.verifyOrder = async (req, res) => {
  try {
    const { orderCode, payosOrderCode } = req.body || {};
    if (!orderCode && !payosOrderCode) {
      return res.status(400).json({ ok: false, message: 'Thiếu orderCode' });
    }

    // PayOS tự nối thêm ?orderCode=<số> vào returnUrl, ghi đè orderCode nội bộ.
    // Vì vậy chấp nhận cả 2 và tìm theo nhiều khả năng.
    const orList = [];
    if (orderCode) {
      orList.push({ orderCode: String(orderCode) });
      const asNum = Number(orderCode);
      if (Number.isFinite(asNum)) orList.push({ payosOrderCode: asNum });
    }
    if (payosOrderCode) {
      const asNum = Number(payosOrderCode);
      if (Number.isFinite(asNum)) orList.push({ payosOrderCode: asNum });
      orList.push({ orderCode: String(payosOrderCode) });
    }

    const order = await PaymentOrder.findOne({ $or: orList, user: req.user._id })
      .sort({ createdAt: -1 });
    if (!order) return res.status(404).json({ ok: false, message: 'Không tìm thấy đơn' });

    if (order.status === 'success') {
      const wallet = await Wallet.findOne({ user: req.user._id });
      return res.json({ ok: true, status: 'success', order, wallet: wallet || { coin: 0, gem: 0 } });
    }

    if (!payos || !order.payosOrderCode) {
      return res.json({ ok: true, status: order.status, order });
    }

    // Gọi PayOS để kiểm tra trạng thái thực tế.
    let info = null;
    try {
      info = await payos.paymentRequests.get(order.payosOrderCode);
    } catch (e) {
      console.error('PayOS get payment error:', e.message);
      return res.status(502).json({ ok: false, message: 'Không kiểm tra được trạng thái PayOS, vui lòng thử lại.' });
    }

    const payosStatus = String(info?.status || '').toUpperCase();
    if (payosStatus === 'PAID') {
      const wallet = await creditOrder(order);
      return res.json({
        ok: true,
        status: 'success',
        order,
        wallet: wallet ? { coin: wallet.coin, gem: wallet.gem } : { coin: 0, gem: 0 },
      });
    }

    if (payosStatus === 'CANCELLED' || payosStatus === 'EXPIRED') {
      if (order.status === 'pending') {
        order.status = 'cancelled';
        await order.save();
      }
      return res.json({ ok: true, status: 'cancelled', order });
    }

    // PENDING / PROCESSING ...
    return res.json({ ok: true, status: 'pending', order, payosStatus });
  } catch (e) {
    console.error('verifyOrder error:', e);
    res.status(500).json({ ok: false, message: e.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderCode } = req.body || {};
    const order = await PaymentOrder.findOne({ orderCode, user: req.user._id });
    if (order && order.status === 'pending') {
      order.status = 'cancelled';
      await order.save();
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
};

// ---------------- VietQR re-fetch ----------------
exports.getPaymentQR = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await PaymentOrder.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ ok: false, message: 'Không tìm thấy đơn' });
    const qrImage = await generatePaymentQR(order.amount, order.orderCode);
    res.json({
      ok: true,
      qrImage,
      accountName: BANK_INFO.accountName,
      accountNo: BANK_INFO.accountNo,
      amount: order.amount,
      orderCode: order.orderCode,
    });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
};

// ---------------- PayOS Webhook ----------------
exports.webhookPayOS = async (req, res) => {
  try {
    if (!payos) return res.status(503).send('PayOS not configured');

    const data = await payos.webhooks.verify(req.body);
    if (!data) return res.status(400).send('Invalid');

    if (String(data.code) !== '00') return res.status(200).send('Ignored');

    let order = await PaymentOrder.findOne({ payosOrderCode: data.orderCode, status: 'pending' });

    if (!order) {
      const desc = data.description || '';
      const orderCodeFromDesc = desc.replace(/^NAP\s*/i, '').trim();
      if (orderCodeFromDesc) {
        order = await PaymentOrder.findOne({ orderCode: orderCodeFromDesc, status: 'pending' });
      }
    }

    if (order) await creditOrder(order);
    res.status(200).send('OK');
  } catch (error) {
    console.error('webhookPayOS error:', error.message);
    res.status(400).send('Webhook Error');
  }
};
