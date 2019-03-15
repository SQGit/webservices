const { Strategy, ExtractJwt } = require('passport-jwt');
const { jwtSecret } = require('./vars');

const Employer = require('../../app/models/employer/employer.model');

const options = {
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromHeader('token'),
};

async function verify(payload, done) {
  try {
    const employer = await Employer.findById(payload._id);
    if (employer) return done(null, employer);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}

module.exports = new Strategy(options, verify);
