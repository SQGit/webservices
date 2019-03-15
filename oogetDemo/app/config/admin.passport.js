const { Strategy } = require('passport-jwt');
const { ExtractJwt } = require('passport-jwt');
const { jwtSecret } = require('./vars');

const Admin = require('../../app/models/admin/admin.model');

const options = {
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromHeader('token'),
};

async function verify(payload, done) {
  try {
    const admin = await Admin.findById(payload._id);
    if (admin) return done(null, admin);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}


module.exports = new Strategy(options, verify);
