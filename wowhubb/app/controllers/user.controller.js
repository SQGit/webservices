const httpStatus = require('http-status');
// const { omit } = require('lodash');
const User = require('../models/user.model');
// const { handler: errorHandler } = require('../middlewares/error');


// NO NEED

exports.create = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(httpStatus.CREATED);
    res.json(savedUser);
  } catch (error) {
    next(error);
  }
};

exports.updatepersonalprofile = async (req, res, next) => {
  const id = req.user._id;
  const { birthday, place, maritalstatus, wedding, socialfunction,
    parties, anniversary, aboutme } = req.body;

  await User.findByIdAndUpdate(id,
    { $set: { birthday,
      place,
      maritalstatus,
      wedding,
      socialfunction,
      parties,
      anniversary,
      aboutme } });

  const user = await User.findById(id);

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: user,
  });
};

exports.getpersonalprofile = async (req, res, next) => {
  const id = req.user._id;

  const user = await User.findById(id);

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: user,
  });
};

exports.personalimage = async (req, res, next) => {
  const id = req.user._id;
  let personalimage = '';

  if (req.files !== undefined) {
    const files = req.files;
    const fields = Object.keys(files);
    personalimage = fields.includes('0') ?
      req.files[0].filename : 'null';
  }

  await User.findByIdAndUpdate(id, { $set: { personalimage } });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: personalimage,
  });
};

exports.personalcover = async (req, res, next) => {
  const id = req.user._id;
  let personalcover = '';

  if (req.files !== undefined) {
    const files = req.files;
    const fields = Object.keys(files);
    personalcover = fields.includes('0') ?
      req.files[0].filename : 'null';
  }

  await User.findByIdAndUpdate(id, { $set: { personalcover } });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: personalcover,
  });
};

exports.personalself = async (req, res, next) => {
  const id = req.user._id;
  let personalself = '';

  if (req.files !== undefined) {
    const files = req.files;
    const fields = Object.keys(files);
    personalself = fields.includes('0') ?
      req.files[0].filename : 'null';
  }

  await User.findByIdAndUpdate(id, { $set: { personalself } });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: personalself,
  });
};


// exports.test = async (req, res, next) => res.json('ok');


// exports.load = async (req, res, next, id) => {
//   try {
//     const user = await User.get(id);
//     req.locals = { user };
//     return next();
//   } catch (error) {
//     return errorHandler(error, req, res);
//   }
// };


// exports.replace = async (req, res, next) => {
//   try {
//     const { user } = req.locals;
//     const newUser = new User(req.body);
//     const ommitRole = user.role !== 'admin' ? 'role' : '';
//     const newUserObject = omit(newUser.toObject(), '_id', ommitRole);

//     await user.update(newUserObject, { override: true, upsert: true });
//     const savedUser = await User.findById(user._id);

//     res.json(savedUser.transform());
//   } catch (error) {
//     next(User.checkDuplicateEmail(error));
//   }
// };


// exports.update = (req, res, next) => {
//   const ommitRole = req.locals.user.role !== 'admin' ? 'role' : '';
//   const updatedUser = omit(req.body, ommitRole);
//   const user = Object.assign(req.locals.user, updatedUser);

//   user.save()
//     .then(savedUser => res.json(savedUser.transform()))
//     .catch(e => next(User.checkDuplicateEmail(e)));
// };


// exports.list = async (req, res, next) => {
//   try {
//     const users = await User.list(req.query);
//     const transformedUsers = users.map(user => user.transform());
//     res.json(transformedUsers);
//   } catch (error) {
//     next(error);
//   }
// };


// exports.remove = (req, res, next) => {
//   const user = req.locals.user;

//   user.remove()
//     .then(() => res.status(httpStatus.NO_CONTENT).end())
//     .catch(e => next(e));
// };
