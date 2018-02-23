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
    parties, anniversary, aboutme, quote, religion, language, country, state,
    sociallinks } = req.body;

  await User.findByIdAndUpdate(id,
    { $set: { birthday,
      place,
      maritalstatus,
      wedding,
      socialfunction,
      parties,
      anniversary,
      aboutme,
      quote,
      religion,
      language,
      country,
      state,
      sociallinks } });

  const user = await User.findById(id, { birthday: 1,
    phone: 1,
    email: 1,
    place: 1,
    maritalstatus: 1,
    wedding: 1,
    socialfunction: 1,
    parties: 1,
    anniversary: 1,
    aboutme: 1,
    designation: 1,
    education: 1,
    workexperience: 1,
    certification: 1,
    volunteer: 1,
    personalimage: 1,
    personalcover: 1,
    personalself: 1,
    quote: 1,
    religion: 1,
    language: 1,
    country: 1,
    state: 1,
    sociallinks: 1,
  });


  return res.json({
    success: true,
    code: httpStatus.OK,
    message: user,
  });
};

// web Profile overview

exports.profileoverview = async (req, res, next) => {
  const id = req.user._id;

  const { place, maritalstatus } = req.body;

  await User.findByIdAndUpdate(id,
    { $set: { place, maritalstatus } });

  const profileoverview = await User.findById(id, {
    place: 1,
    maritalstatus: 1,
  });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: profileoverview,
  });
};

// web About me

exports.profileaboutme = async (req, res, next) => {
  const id = req.user._id;

  const { aboutme, quote, religion, language, birthday } = req.body;

  await User.findByIdAndUpdate(id,
    { $set: { aboutme, quote, religion, language, birthday } });

  const profileaboutme = await User.findById(id, {
    aboutme: 1, quote: 1, religion: 1, language: 1, birthday: 1,
  });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: profileaboutme,
  });
};

// web Profile contact

exports.profilecontact = async (req, res, next) => {
  const id = req.user._id;

  const { country, state, sociallinks } = req.body;

  await User.findByIdAndUpdate(id,
    { $set: { country, state, sociallinks } });

  const profilecontact = await User.findById(id, {
    country: 1, state: 1, sociallinks: 1,
  });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: profilecontact,
  });
};

// web Profile Event info

exports.profileinfo = async (req, res, next) => {
  const id = req.user._id;

  const { wedding, anniversary, socialfunction, parties } = req.body;

  await User.findByIdAndUpdate(id,
    { $set: { wedding, anniversary, socialfunction, parties } });

  const profileinfo = await User.findById(id, {
    wedding: 1, anniversary: 1, socialfunction: 1, parties: 1,
  });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: profileinfo,
  });
};

exports.getpersonalprofile = async (req, res, next) => {
  try {
    const id = req.user._id;

    const user = await User.findById(id, { birthday: 1,
      phone: 1,
      email: 1,
      place: 1,
      maritalstatus: 1,
      wedding: 1,
      socialfunction: 1,
      parties: 1,
      anniversary: 1,
      aboutme: 1,
      designation: 1,
      workplace: 1,
      education: 1,
      workexperience: 1,
      certification: 1,
      volunteer: 1,
      personalimage: 1,
      personalcover: 1,
      personalself: 1,
      quote: 1,
      religion: 1,
      language: 1,
      country: 1,
      state: 1,
      sociallinks: 1,
      relationship: 1,
    });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: user,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getthirdpartyprofile = async (req, res, next) => {
  try {
    const { userid } = req.body;

    const user = await User.findById(userid, { birthday: 1,
      phone: 1,
      email: 1,
      wowtagid: 1,
      place: 1,
      maritalstatus: 1,
      wedding: 1,
      socialfunction: 1,
      parties: 1,
      anniversary: 1,
      aboutme: 1,
      designation: 1,
      workplace: 1,
      education: 1,
      workexperience: 1,
      certification: 1,
      volunteer: 1,
      personalimage: 1,
      personalcover: 1,
      personalself: 1,
      quote: 1,
      religion: 1,
      language: 1,
      country: 1,
      state: 1,
      sociallinks: 1,
      firstname: 1,
      lastname: 1,
      interests: 1,
      relationship: 1,
    });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: user,
    });
  } catch (error) {
    return next(error);
  }
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

exports.updateprofessionalprofile = async (req, res, next) => {
  const dataArray = [];
  const id = req.user._id;
  const { designation, workplace, education, certification, volunteer } = req.body;

  await User.findByIdAndUpdate(id, { $set: { designation,
    workplace,
    education: [],
    certification: [],
    volunteer: [] } },
  { safe: true, upsert: true, new: true });

  for (let i = 0; i < education.length; i += 1) {
    dataArray.push(User.findByIdAndUpdate(id, { $push: { education: education[i] } },
      { safe: true, upsert: true, new: true }));
  }

  for (let i = 0; i < certification.length; i += 1) {
    dataArray.push(User.findByIdAndUpdate(id, { $push: { certification: certification[i] } },
      { safe: true, upsert: true, new: true }));
  }

  for (let i = 0; i < volunteer.length; i += 1) {
    dataArray.push(User.findByIdAndUpdate(id, { $push: { volunteer: volunteer[i] } },
      { safe: true, upsert: true, new: true }));
  }

  await Promise.all(dataArray);

  const user = await User.findById(id, { designation: 1,
    workplace: 1,
    education: 1,
    workexperience: 1,
    certification: 1,
    volunteer: 1 });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: user,
  });
};

exports.updateworkexperience = async (req, res, next) => {
  try {
    const id = req.user._id;

    const { workexperience } = req.body;

    const workexperienceArray = [];

    await User.findByIdAndUpdate(id, { $set: { workexperience: [] } });

    if (workexperience !== undefined) {
      for (let i = 0; i < workexperience.length; i += 1) {
        workexperienceArray.push(User.findByIdAndUpdate(id, { $push:
          { workexperience: workexperience[i] } }, {
          safe: true, upsert: true, new: true,
        }));
      }

      await Promise.all(workexperienceArray);
    }

    const user = await User.findById(id, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: user,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getprofessionalprofile = async (req, res, next) => {
  const id = req.user._id;

  const user = await User.findById(id, { designation: 1,
    workplace: 1,
    education: 1,
    workexperience: 1,
    certification: 1,
    volunteer: 1 });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: user,
  });
};

exports.updaterelationship = async (req, res, next) => {
  const id = req.user._id;

  const { relationship } = req.body;

  const relationArray = [];

  await User.findByIdAndUpdate(id, { $set: { relationship: [] } },
    { safe: true, upsert: true, new: true });

  if (relationship !== undefined) {
    for (let i = 0; i < relationship.length; i += 1) {
      relationArray.push(User.findByIdAndUpdate(id, { $push: { relationship: relationship[i] } },
        { safe: true, upsert: true, new: true }));
    }

    await Promise.all(relationArray);
  }

  const relation = await User.find(id, { relationship: 1 });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: relation,
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
