// Catalog các gói nạp - Catalog của game. Sửa giá/quà tùy ý.
const PACKAGES = [
  // ----- COIN -----
  { id: 'coin_10k', type: 'coin', name: 'Gói Tân Thủ', amount: 10000, coin: 100, gem: 0, tag: 'NEW' },
  { id: 'coin_20k', type: 'coin', name: 'Gói 220 Xu', amount: 20000, coin: 220, gem: 0 },
  { id: 'coin_50k', type: 'coin', name: 'Gói 600 Xu', amount: 50000, coin: 600, gem: 0, tag: 'HOT' },
  { id: 'coin_100k', type: 'coin', name: 'Gói 1300 Xu', amount: 100000, coin: 1300, gem: 0 },
  { id: 'coin_200k', type: 'coin', name: 'Gói 2800 Xu', amount: 200000, coin: 2800, gem: 0 },
  { id: 'coin_500k', type: 'coin', name: 'Gói 7500 Xu', amount: 500000, coin: 7500, gem: 50, tag: 'BEST' },

  // ----- GEM -----
  { id: 'gem_20k', type: 'gem', name: 'Gói 100 Gem', amount: 20000, coin: 0, gem: 100 },
  { id: 'gem_50k', type: 'gem', name: 'Gói 270 Gem', amount: 50000, coin: 0, gem: 270, tag: 'HOT' },
  { id: 'gem_100k', type: 'gem', name: 'Gói 560 Gem', amount: 100000, coin: 0, gem: 560 },
  { id: 'gem_200k', type: 'gem', name: 'Gói 1200 Gem', amount: 200000, coin: 0, gem: 1200 },
  { id: 'gem_500k', type: 'gem', name: 'Gói 3200 Gem', amount: 500000, coin: 0, gem: 3200, tag: 'BEST' },
  { id: 'gem_1m', type: 'gem', name: 'Gói 7000 Gem', amount: 1000000, coin: 0, gem: 7000 },

  // ----- PROMO / ƯU ĐÃI -----
  { id: 'promo_starter', type: 'promo', name: 'Combo Tân Thủ', amount: 50000, coin: 800, gem: 100, bonus: 'Tặng skin "Sơ Tâm" + 3 lượt rút thẻ', tag: 'LIMIT' },
  { id: 'promo_weekly', type: 'promo', name: 'Quà Tuần', amount: 99000, coin: 1500, gem: 250, bonus: 'Tặng 7 ngày VIP1 + 500 EXP', tag: 'WEEK' },
  { id: 'promo_monthly', type: 'promo', name: 'Quỹ Tháng', amount: 199000, coin: 3500, gem: 600, bonus: '30 ngày nhận quà mỗi ngày', tag: 'MONTH' },
  { id: 'promo_x2', type: 'promo', name: 'Nạp X2 Lần Đầu', amount: 100000, coin: 1300, gem: 1120, bonus: 'X2 Gem cho lần nạp đầu tiên gói này', tag: 'X2' },
];

function findPackage(id) {
  return PACKAGES.find(p => p.id === id) || null;
}

// Tất cả logo lưu tại backend/public/logos/*.png và serve qua /public/logos/*.png.
// Muốn đổi sang logo thật → chỉ cần ghi đè file ảnh, không cần sửa code.
const PAYMENT_METHODS = [
  {
    id: 'bank',
    name: 'Chuyển khoản ngân hàng',
    desc: 'Chuyển khoản nhanh 24/7 qua Internet Banking',
    image: '/public/logos/bank.png',
    options: ['MB Bank'],
  },
  {
    id: 'momo',
    name: 'Ví MoMo',
    desc: 'Quét QR thanh toán bằng ứng dụng MoMo',
    image: '/public/logos/momo.png',
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    desc: 'Quét QR thanh toán bằng ZaloPay',
    image: '/public/logos/zalopay.png',
  },
  {
    id: 'vnpay',
    name: 'VNPay QR',
    desc: 'Quét QR bằng app ngân hàng có hỗ trợ VNPay',
    image: '/public/logos/vnpay.png',
  },
  {
    id: 'atm',
    name: 'Thẻ ATM nội địa',
    desc: 'Thẻ ATM/Napas có đăng ký Internet Banking',
    image: '/public/logos/napas.png',
    options: ['MB Bank'],
  },
  {
    id: 'card',
    name: 'Thẻ Visa / Master / JCB',
    desc: 'Thanh toán bằng thẻ tín dụng / ghi nợ quốc tế',
    image: '/public/logos/visa.png',
  },
  {
    id: 'telco',
    name: 'Thẻ cào nhà mạng',
    desc: 'Viettel, Mobifone, Vinaphone… (chiết khấu ~30%)',
    image: '/public/logos/telco.png',
    options: ['Viettel', 'Mobifone', 'Vinaphone', 'Vietnamobile', 'Gmobile'],
    denominations: [10000, 20000, 50000, 100000, 200000, 500000],
  },
];

module.exports = { PACKAGES, findPackage, PAYMENT_METHODS };
