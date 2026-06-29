const User = require('../models/User');
const OtpReset = require('../models/OtpReset');
const { registerSchema, loginSchema, forgotSchema, resetSchema } = require('../utils/validators');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateOtp, hashOtp, compareOtp } = require('../utils/otp');
const { sendOtpMail } = require('../services/mailService');
const { signToken } = require('../middleware/auth');

const RESEND_COOLDOWN_MS = 60 * 1000;

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar || null,
    provider: u.provider
  };
}

exports.register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ ok: false, message: error.details[0].message });

    const { name, email, password } = value;
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ ok: false, message: 'Email này đã tồn tại' });

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name, email: email.toLowerCase(), passwordHash,
      provider: 'local', isEmailVerified: true
    });
    const token = signToken(user);
    return res.status(201).json({ ok: true, token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Có lỗi xảy ra khi đăng ký' });
  }
};

exports.login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ ok: false, message: 'Thông tin đăng nhập không hợp lệ' });

    const user = await User.findOne({ email: value.email.toLowerCase() });
    if (!user) return res.status(401).json({ ok: false, message: 'Email hoặc mật khẩu không đúng' });

    const ok = await comparePassword(value.password, user.passwordHash);
    if (!ok) return res.status(401).json({ ok: false, message: 'Email hoặc mật khẩu không đúng' });

    const token = signToken(user);
    return res.json({ ok: true, token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Có lỗi xảy ra khi đăng nhập' });
  }
};

exports.me = async (req, res) => res.json({ ok: true, user: publicUser(req.user) });

// JWT là stateless: client chỉ cần xoá token. Endpoint này tồn tại cho symmetry.
exports.logout = (_req, res) => res.json({ ok: true });

exports.sendOtp = async (req, res) => {
  try {
    const { error, value } = forgotSchema.validate(req.body);
    if (error) return res.status(400).json({ ok: false, message: 'Vui lòng nhập email hợp lệ.' });

    const email = value.email.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ ok: false, message: 'Không tìm thấy tài khoản với email này.' });

    const last = await OtpReset.findOne({ email }).sort({ createdAt: -1 });
    if (last) {
      const elapsed = Date.now() - new Date(last.createdAt).getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        const wait = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return res.status(429).json({ ok: false, message: `Vui lòng đợi ${wait}s để gửi lại OTP.`, retryAfter: wait });
      }
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    await OtpReset.deleteMany({ email, used: false });
    await OtpReset.create({ email, otpHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });

    // Trả response ngay, gửi mail chạy nền để tránh frontend timeout do SMTP chậm
    res.json({ ok: true, message: 'OTP đã được gửi về email của bạn.', cooldown: RESEND_COOLDOWN_MS / 1000 });

    sendOtpMail(email, otp, user.name || 'Khách hàng').catch(err => {
      console.error('[sendOtp] Mail send failed for', email, '-', err.message);
    });
    return;
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Không thể gửi OTP. Kiểm tra lại cấu hình mail.' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const otp = String(req.body.otp || '').trim();
    if (!email || !/^\d{6}$/.test(otp)) return res.status(400).json({ ok: false, message: 'OTP phải gồm 6 chữ số.' });

    const record = await OtpReset.findOne({ email, used: false }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ ok: false, message: 'OTP không tồn tại hoặc đã hết hạn.' });
    if (record.expiresAt.getTime() < Date.now()) return res.status(400).json({ ok: false, message: 'OTP đã hết hạn.' });

    const valid = await compareOtp(otp, record.otpHash);
    if (!valid) return res.status(400).json({ ok: false, message: 'OTP không chính xác.' });

    record.verified = true;
    await record.save();
    return res.json({ ok: true, message: 'OTP hợp lệ. Vui lòng nhập mật khẩu mới.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Có lỗi xảy ra khi xác minh OTP.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { error, value } = resetSchema.validate(req.body);
    if (error) return res.status(400).json({ ok: false, message: error.details[0].message });

    const email = value.email.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ ok: false, message: 'Tài khoản không tồn tại' });

    const record = await OtpReset.findOne({ email, used: false }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ ok: false, message: 'OTP không tồn tại hoặc đã hết hạn' });
    if (record.expiresAt.getTime() < Date.now()) return res.status(400).json({ ok: false, message: 'OTP đã hết hạn' });
    if (!record.verified) return res.status(400).json({ ok: false, message: 'Vui lòng xác minh OTP trước khi đổi mật khẩu.' });

    const validOtp = await compareOtp(value.otp, record.otpHash);
    if (!validOtp) return res.status(400).json({ ok: false, message: 'OTP không chính xác' });

    user.passwordHash = await hashPassword(value.password);
    await user.save();
    record.used = true;
    await record.save();

    return res.json({ ok: true, message: 'Đổi mật khẩu thành công, hãy đăng nhập lại.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Không thể đổi mật khẩu, vui lòng thử lại.' });
  }
};

// ===== OAuth: callback redirect về frontend kèm token =====
const passport = require('passport');

function oauthCallback(provider) {
  return [
    passport.authenticate(provider, { session: false, failureRedirect: oauthFailRedirect() }),
    (req, res) => {
      const token = signToken(req.user);
      const url = `${process.env.FRONTEND_URL}/oauth-callback#token=${encodeURIComponent(token)}`;
      return res.redirect(url);
    }
  ];
}

function oauthFailRedirect() {
  return `${process.env.FRONTEND_URL}/login?oauth=failed`;
}

exports.googleLogin = passport.authenticate('google', { session: false, scope: ['profile', 'email'] });
exports.googleCallback = oauthCallback('google');
exports.facebookLogin = passport.authenticate('facebook', { session: false, scope: ['email'] });
exports.facebookCallback = oauthCallback('facebook');

exports.oauthStatus = (_req, res) => {
  const { oauthEnabled } = require('../config/passport');
  res.json({ ok: true, oauth: oauthEnabled });
};
