const Joi = require('joi');
const { STRONG_PASSWORD_REGEX } = require('./password');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(60).required().messages({
    'string.empty': 'Vui lòng nhập họ tên'
  }),
  email: Joi.string().email({ tlds: false }).required().messages({
    'string.email': 'Email không hợp lệ'
  }),
  password: Joi.string().pattern(STRONG_PASSWORD_REGEX).required().messages({
    'string.pattern.base': 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
  }),
  confirmPassword: Joi.valid(Joi.ref('password')).required().messages({
    'any.only': 'Xác nhận mật khẩu không khớp'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).required(),
  password: Joi.string().required()
});

const forgotSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).required()
});

const resetSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).required(),
  otp: Joi.string().length(6).required(),
  password: Joi.string().pattern(STRONG_PASSWORD_REGEX).required().messages({
    'string.pattern.base': 'Mật khẩu mới chưa đủ mạnh'
  }),
  confirmPassword: Joi.valid(Joi.ref('password')).required().messages({
    'any.only': 'Xác nhận mật khẩu không khớp'
  })
});

module.exports = { registerSchema, loginSchema, forgotSchema, resetSchema };
