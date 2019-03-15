const { Strategy, ExtractJwt } = require('passport-jwt');
const { jwtSecret } = require('./vars');

const Jobseeker = require('../../app/models/jobseeker/jobseeker.model');

const options = {
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromHeader('token'),
};

async function verify(payload, done) {
  try {
    const jobseeker = await Jobseeker.findById(payload._id);
    if (jobseeker) return done(null, jobseeker);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}

module.exports = new Strategy(options, verify);
