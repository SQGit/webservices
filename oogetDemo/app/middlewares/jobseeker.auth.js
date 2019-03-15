const passport = require('passport');

exports.jobseekerauthorize = () => (req, res, next) => passport.authenticate('jobseekerjwt', { session: false })(
  req,
  res,
  next,
);
