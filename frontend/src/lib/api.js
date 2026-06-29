export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const Auth = {
  get token() {
    return localStorage.getItem(TOKEN_KEY);
  },
  get user() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  set(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth-changed'));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('auth-changed'));
  },
  isLoggedIn() {
    return !!this.token;
  },
};

export async function api(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && Auth.token) headers['Authorization'] = 'Bearer ' + Auth.token;

  let res, data;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    data = await res.json().catch(() => ({}));
  } catch {
    throw new Error('Không kết nối được tới server. Kiểm tra VITE_API_BASE trong .env.');
  }
  if (!res.ok || data.ok === false) {
    const err = new Error(data.message || 'HTTP ' + res.status);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// --- Các API phục vụ chức năng Thanh toán & Ví ---

/**
 * Lấy danh sách gói nạp và phương thức thanh toán hỗ trợ
 */
export async function getPackages() {
  return api('/payment/packages');
}

/**
 * Lấy thông tin số dư ví của người dùng hiện tại
 */
export async function getWallet() {
  return api('/payment/wallet', { auth: true });
}

/**
 * Lấy lịch sử giao dịch nạp tiền
 */
export async function getPaymentHistory() {
  return api('/payment/history', { auth: true });
}

/**
 * Tạo một đơn hàng nạp tiền mới (Nếu chọn Bank, Backend sẽ trả về kèm qrImage)
 * @param {string} packageId - ID của gói cước cần nạp
 * @param {string} method - Phương thức thanh toán ('bank', 'momo', 'vnpay'...)
 * @param {object} methodDetail - Chi tiết (Ví dụ: { bank: 'vcb' } nếu nạp qua bank)
 */
export async function createPaymentOrder(packageId, method, methodDetail = {}) {
  return api('/payment/order', {
    method: 'POST',
    body: { packageId, method, methodDetail },
    auth: true, // Route yêu cầu đăng nhập để lấy thông tin req.user._id
  });
}

/**
 * Gửi yêu cầu xác nhận đã chuyển tiền (Giả lập tăng số dư tức thì trong môi trường test)
 * @param {string} orderCode - Mã đơn hàng cần xác nhận (Ví dụ: NAPXXXX)
 */
export async function confirmPaymentOrder(orderCode) {
  return api('/payment/order/confirm', {
    method: 'POST',
    body: { orderCode },
    auth: true,
  });
}

/**
 * Hủy bỏ đơn hàng thanh toán đang ở trạng thái chờ
 * @param {string} orderCode - Mã đơn hàng cần hủy
 */
export async function cancelPaymentOrder(orderCode) {
  return api('/payment/order/cancel', {
    method: 'POST',
    body: { orderCode },
    auth: true,
  });
}

/**
 * API dự phòng: Lấy lại ảnh QR từ lịch sử đơn hàng (qua Route GET mới bổ sung)
 * @param {string} orderId - _id dạng ObjectId của MongoDB
 */
export async function getPaymentQR(orderId) {
  return api(`/payment/order/${orderId}/qr`, { auth: true });
}
