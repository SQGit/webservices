// const httpStatus = require('http-status');
const User = require('../models/user.model');
const Keyword = require('../models/keyword.model');


exports.emptyfriends = async (req, res, next) => {
  try {
    const user = await User.update({}, { $set: { friends: [],
      friendrequestsent: [],
      friendrequestreceived: [] } }, { multi: true });

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};


exports.addkeyword = async (req, res, next) => {
  try {
    const word = new Keyword(req.body);
    const savedWord = await word.save();
    return res.json({
      success: true,
      savedWord,
    });
  } catch (error) {
    return next(error);
  }
};

