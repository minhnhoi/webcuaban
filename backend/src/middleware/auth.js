const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function requireAuth(req, res, next) {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, message: 'Chưa đăng nhập' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ ok: false, message: 'Phiên đăng nhập không hợp lệ' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

module.exports = { signToken, requireAuth };
