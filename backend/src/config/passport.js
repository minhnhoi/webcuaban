const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook').Strategy;

async function findOrCreateSocialUser({ provider, providerId, email, name, avatar }) {
  let user = await User.findOne({ provider, providerId });
  if (user) return user;

  if (email) {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      existingEmail.provider = provider;
      existingEmail.providerId = providerId;
      existingEmail.isEmailVerified = true;
      if (!existingEmail.avatar && avatar) existingEmail.avatar = avatar;
      await existingEmail.save();
      return existingEmail;
    }
  }

  const randomPass = await bcrypt.hash(Math.random().toString(36), 10);
  return User.create({
    name: name || 'Social User',
    email: email || `${provider}_${providerId}@no-email.local`,
    passwordHash: randomPass,
    provider, providerId, avatar,
    isEmailVerified: !!email
  });
}

const oauthEnabled = { google: false, facebook: false };

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.APP_URL}/auth/google/callback`
  }, async (_a, _r, profile, done) => {
    try {
      const user = await findOrCreateSocialUser({
        provider: 'google', providerId: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        avatar: profile.photos?.[0]?.value
      });
      done(null, user);
    } catch (e) { done(e, null); }
  }));
  oauthEnabled.google = true;
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.APP_URL}/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'emails', 'photos']
  }, async (_a, _r, profile, done) => {
    try {
      const user = await findOrCreateSocialUser({
        provider: 'facebook', providerId: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        avatar: profile.photos?.[0]?.value
      });
      done(null, user);
    } catch (e) { done(e, null); }
  }));
  oauthEnabled.facebook = true;
}

module.exports = passport;
module.exports.oauthEnabled = oauthEnabled;
