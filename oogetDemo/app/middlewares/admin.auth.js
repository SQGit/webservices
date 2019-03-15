const passport = require('passport');

exports.adminauthorize = () => (req, res, next) =>
  passport.authenticate('adminjwt', { session: false })(
    req,
    res,
    next,
  );
