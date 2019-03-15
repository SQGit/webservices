const httpStatus = require('http-status');
const User = require('../models/user.model');
const Keyword = require('../models/keyword.model');
const Event = require('../models/event.model');


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

exports.fetchevents = async(req, res, next) => {
  try {
    const events = await Event.find({},{})
    .populate('userid', 'wowtagid personalimageurl firstname lastname -_id');

    return res.json({
      success: true,
      code: httpStatus.OK,
      events
    })
  } catch (error) {
    return next(error);
  }
}

exports.fetchusers = async(req, res, next) => {
  try {
    const users = await User.find({},{password: 0,oldpasswords: 0})
    .populate('friends', 'wowtagid personalimageurl firstname lastname')
    .populate('friendrequestsent', 'wowtagid personalimageurl firstname lastname')
    .populate('friendrequestreceived', 'wowtagid personalimageurl firstname lastname')
    .populate('business', 'companyname')
    .populate('eventservice', 'companyname')
    .populate('eventvenue', 'companyname')
    .lean();

  for(let i=0; i<users.length;i++){
    let event = await Event.find({userid: users[i]._id},{})
    let eventcount = event.length;
    users[i].eventcount = eventcount;
  }

  return res.json({
    success: true,
    code: httpStatus.OK,
    users
  })
  } catch (error) {
    return next(error);
  }
}

exports.fetchparticularuser = async(req, res, next) => {
  try {

    const { userid } = req.body;

    const user = await User.findById(userid,{password: 0,oldpasswords: 0})
    .populate('friends', 'wowtagid personalimageurl firstname lastname')
    .populate('friendrequestsent', 'wowtagid personalimageurl firstname lastname')
    .populate('friendrequestreceived', 'wowtagid personalimageurl firstname lastname')
    .populate('business', 'companyname')
    .populate('eventservice', 'companyname')
    .populate('eventvenue', 'companyname');

  return res.json({
    success: true,
    code: httpStatus.OK,
    user
  })
  } catch (error) {
    return next(error);
  }
}
