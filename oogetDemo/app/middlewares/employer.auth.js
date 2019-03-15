const passport = require('passport');

exports.employerauthorize = () => (req, res, next) => passport.authenticate('employerjwt', { session: false })(
  req,
  res,
  next,
);
