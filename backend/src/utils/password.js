const bcrypt = require('bcryptjs');

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function isStrongPassword(password) {
  return STRONG_PASSWORD_REGEX.test(password);
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  STRONG_PASSWORD_REGEX,
  isStrongPassword,
  hashPassword,
  comparePassword
};
