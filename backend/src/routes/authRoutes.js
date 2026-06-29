const router = require('express').Router();
const c = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.get('/oauth-status', c.oauthStatus);

router.post('/register', c.register);
router.post('/login', c.login);
router.post('/logout', c.logout);
router.get('/me', requireAuth, c.me);

router.post('/send-otp', c.sendOtp);
router.post('/verify-otp', c.verifyOtp);
router.post('/reset-password', c.resetPassword);

router.get('/google', c.googleLogin);
router.get('/google/callback', ...c.googleCallback);

router.get('/facebook', c.facebookLogin);
router.get('/facebook/callback', ...c.facebookCallback);

module.exports = router;
