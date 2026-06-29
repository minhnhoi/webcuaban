// backend/services/vietqr.js

// Cấu hình thông tin ngân hàng cố định của bạn
const BANK_CONFIG = {
  bankId: 'MB',                 // Mã ngân hàng viết tắt chuẩn (MB, VCB, TCB, ACB, CTG...)
  accountNo: '0968278307',       // Số tài khoản của bạn
  accountName: 'PHAM QUANG MINH'
};

/**
 * Hàm trả về link ảnh QR động chuẩn mã hóa VietQR
 */
const generatePaymentQR = async (amount, orderId) => {
  try {
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Số tiền thanh toán không hợp lệ');
    }

    const description = `${orderId}`; // Nội dung chuyển khoản là mã đơn hàng gọn gàng

    // Sử dụng template 'qr_only' hoặc 'compact2' của VietQR.io để sinh ảnh động trực tiếp
    const qrImageUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

    // Trả về trực tiếp URL ảnh này, Frontend thẻ <img src="..."> đọc được ngay lập tức
    return qrImageUrl;
  } catch (error) {
    console.error('Lỗi sinh VietQR:', error.message);
    throw error;
  }
};

module.exports = { generatePaymentQR };