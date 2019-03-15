const { Strategy } = require('passport-jwt');
const { ExtractJwt } = require('passport-jwt');
const { jwtSecret } = require('./vars');
// const User = require('../../app/models/user.model');
const User = require('../sqlmodels/user.model');


const options = {
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromHeader('token'),
};

// async function verify(payload, done) {
//   try {
//     const user = await User.findById(payload._id);
//     if (user) return done(null, user);
//     return done(null, false);
//   } catch (error) {
//     return done(error, false);
//   }
// }

async function verify(payload, done){
  try {
    const user = await User.findById(payload.userid)
    if(user) return done(null,user);
  } catch (error) {
    return done(error, false);
  }
}

module.exports = new Strategy(options, verify);
