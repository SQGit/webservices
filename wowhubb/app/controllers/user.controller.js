const httpStatus = require('http-status');
const User = require('../models/user.model');
// const { handler: errorHandler } = require('../middlewares/error');
const moment = require('moment')


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
  const dataArray = [];
  const { birthday, place, maritalstatus, wedding, socialfunction,
    parties, anniversary, aboutme, quote, religion, language, country, state,
    sociallinks,gender,
  } = req.body;

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
      gender,
      birthday,
      sociallinks: [] } });

  for (let i = 0; i < sociallinks.length; i += 1) {
    dataArray.push(User.findByIdAndUpdate(id, { $push: { sociallinks: sociallinks[i] } },
      { safe: true, upsert: true, new: true }));
  }

  await Promise.all(dataArray);

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
    personalimageurl: 1,
    personalcoverurl: 1,
    personalselfurl: 1,
    personalselfthumb: 1,
    quote: 1,
    religion: 1,
    language: 1,
    country: 1,
    state: 1,
    sociallinks: 1,
    gender: 1
  });


  return res.json({
    success: true,
    code: httpStatus.OK,
    message: user,
  });
};

exports.updateemailvisible = async(req, res, next) => {
  try {
    const id = req.user._id;
    const { emailvisible } = req.body;
    await User.findByIdAndUpdate(id,{$set: {emailvisible}});

    return res.json({
      success: true,
      code: httpStatus.OK,
      emailvisible
    })

  } catch (error) {
    return next(error);
  }
}

exports.updatephonevisible = async(req, res, next) => {
  try {
    const id = req.user._id;
    const { phonevisible } = req.body;
    await User.findByIdAndUpdate(id,{$set: {phonevisible}});

    return res.json({
      success: true,
      code: httpStatus.OK,
      phonevisible
    })

  } catch (error) {
    return next(error);
  }
}

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
  const dataArray = [];

  const { country, state } = req.body;

  await User.findByIdAndUpdate(id,
    { $set: { country, state} });


  const profilecontact = await User.findById(id, {
    country: 1, state: 1
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

  const { birthday, gender } = req.body;

  await User.findByIdAndUpdate(id,
    { $set: { birthday, gender } });

  const profileinfo = await User.findById(id, {
    birthday: 1, gender: 1
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
      wowtagid: 1,
      gender: 1,
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
      personalimageurl: 1,
      personalcoverurl: 1,
      personalselfurl: 1,
      personalselfthumb: 1,
      quote: 1,
      religion: 1,
      language: 1,
      country: 1,
      state: 1,
      sociallinks: 1,
      relationship: 1,
      college: 1,
      professionalskills: 1,
      relationshipstatus: 1,
      relationshipwith: 1,
      phonevisible: 1,
      emailvisible: 1,
      friends: 1
    }).populate('friends', 'wowtagid personalimageurl firstname lastname');

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
      gender: 1,
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
      personalimageurl: 1,
      personalcoverurl: 1,
      personalselfurl: 1,
      personalselfthumb: 1,
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
      college: 1,
      professionalskills: 1,
      relationshipstatus: 1,
      relationshipwith: 1,
      phonevisible: 1,
      emailvisible: 1
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
  let personalimageurl = '';
  let personalimagethumb = '';

  const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

  if (req.files !== undefined) {
    const files = req.files;
    const fields = Object.keys(files);

    personalimage = fields.includes('0') ? req.files[0].public_id : 'null';
    personalimageurl = fields.includes('0') ? req.files[0].url : 'null';
    personalimagethumb = fields.includes('0') ? (req.files[0].format === 'mp4' ? `http://res.cloudinary.com/www-wowhubb-com/video/upload/v1524468143/${personalimage}.jpg` : 'null') : 'null';
  }

  await User.findByIdAndUpdate(id, { $set: { personalimage, personalimageurl, personalimagethumb } });

  await User.findByIdAndUpdate(id, { $push: {oldpersonalimageurls: {oldpersonalimageurl: personalimageurl, createdAt } } });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: personalimageurl,
  });
};

exports.personalgallery = async(req, res, next) => {
  try {
    const id = req.user._id;
    const gallery = await User.findById(id,{oldpersonalimageurls: 1});

    return res.json({
      success: true,
      code: httpStatus.OK,
      gallery
    })

  } catch (error) {
    return next(error);
  }
}

exports.personalcover = async (req, res, next) => {
  const id = req.user._id;
  let personalcover = '';
  let personalcoverurl = '';
  let personalcoverthumb = '';

  if (req.files !== undefined) {
    const files = req.files;
    const fields = Object.keys(files);

    personalcover = fields.includes('0') ? req.files[0].public_id : 'null';
    personalcoverurl = fields.includes('0') ? req.files[0].url : 'null';
    personalcoverthumb = fields.includes('0') ? (req.files[0].format === 'mp4' ? `http://res.cloudinary.com/www-wowhubb-com/video/upload/v1524468143/${personalcover}.jpg` : 'null') : 'null';
  }

  await User.findByIdAndUpdate(id, { $set: { personalcover, personalcoverurl, personalcoverthumb } });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: personalcoverurl,
  });
};

exports.personalself = async (req, res, next) => {
  const id = req.user._id;
  let personalself = '';
  let personalselfurl = '';
  let personalselfthumb = '';

  if (req.files !== undefined) {
    const files = req.files;
    const fields = Object.keys(files);

    personalself = fields.includes('0') ? req.files[0].public_id : 'null';
    personalselfurl = fields.includes('0') ? req.files[0].url : 'null';
    personalselfthumb = fields.includes('0') ? (req.files[0].format === 'mp4' ? `http://res.cloudinary.com/www-wowhubb-com/video/upload/v1524468143/${personalself}.jpg` : 'null') : 'null';
  }

  await User.findByIdAndUpdate(id, { $set: { personalself, personalselfurl, personalselfthumb } });

  return res.json({
    success: true,
    code: httpStatus.OK,
    personalselfurl,
    personalselfthumb
  });
};

exports.updateprofessionalprofile = async (req, res, next) => {
  const dataArray = [];
  const id = req.user._id;
  const { certification } = req.body;

  await User.findByIdAndUpdate(id, { $set: { 
    certification: []} },
  { safe: true, upsert: true, new: true });

  for (let i = 0; i < certification.length; i += 1) {
    dataArray.push(User.findByIdAndUpdate(id, { $push: { certification: certification[i] } },
      { safe: true, upsert: true, new: true }));
  }

  await Promise.all(dataArray);

  const user = await User.findById(id, {
    certification: 1,
  });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: user,
  });
};

exports.updatecollegedetails = async (req, res, next) => {
  const dataArray = [];
  const id = req.user._id;
  const { college } = req.body;

  await User.findByIdAndUpdate(id, { $set: { 
    college: []} },
  { safe: true, upsert: true, new: true });

  for (let i = 0; i < college.length; i += 1) {
    dataArray.push(User.findByIdAndUpdate(id, { $push: { college: college[i] } },
      { safe: true, upsert: true, new: true }));
  }

  await Promise.all(dataArray);

  const user = await User.findById(id, {
    college: 1,
  });

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

exports.updateprofessionalskills = async(req, res, next) => {
  try {
    const id = req.user._id;
    const skillsArray = [];
    const { professionalskills } = req.body;

    await User.findByIdAndUpdate(id, { $set: { professionalskills: [] } },
      { safe: true, upsert: true, new: true });

    if (professionalskills !== undefined) {
      for (let i = 0; i < professionalskills.length; i += 1) {
        skillsArray.push(User.findByIdAndUpdate(id, { $push: { professionalskills: professionalskills[i] } },
          { safe: true, upsert: true, new: true }));
      }

      await Promise.all(skillsArray);
    }

    const user = await User.findById(id, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: user
    })



     
  } catch (error) {
    return next(error);
  }
}

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

exports.updaterelationshipstatus = async(req, res, next) => {
  try {
    const id = req.user._id;
    const { relationshipstatus, relationshipwith } = req.body;

    await User.findByIdAndUpdate(id, {$set: {relationshipstatus, relationshipwith}});
    const user = await User.findById(id,{});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: user,
    });

  } catch (error) {
    return next(error);
  }
}


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
