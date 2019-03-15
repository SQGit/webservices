const passport = require('passport');

exports.authorize = () => (req, res, next) =>
  passport.authenticate('jwt', { session: false })(
    req,
    res,
    next,
  );
