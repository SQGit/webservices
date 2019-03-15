const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const User = require('../models/user.model');
const Version = require('../models/version.model');
const { jwtSecret } = require('../config/vars');
const transporter = require('../middlewares/mail');
const moment = require('moment');

const Test = require('../models/test.model');

// const client = twilio(accountSid, authToken);

/* Twilio Config */

const accountSid = 'ACc04aaaa52c3762a0a051b264d229d43e';
const authToken = 'd8b0a4f0ef8ec9e33e5a08f52cbf526e';

const client = twilio(accountSid, authToken);

/*  */

function generateTokenResponse(user) {
  const accessToken = jwt.sign(user, jwtSecret, {
    expiresIn: '365 days',
  });
  // const expiresIn = '2 days';
  // return { accessToken, expiresIn };
  return accessToken;
}

exports.test = async (req, res, next) => {
  // const { userid,post } = req.body;
  // const value = await (new Test({userid,post})).save();
  // return res.json({ status: true,message: value })
  const user = await Test.findOne({ post: 'hello there' })
    .populate('userid', 'firstname -_id');

  return res.json({ success: true, user });
};

/* exports.otp = async (req, res, next) => {          // eslint-disable-line
  const otp = Math.floor(Math.random() * 9000) + 1000;
  const { tonumber } = req.body;

  const checkuser = await User.findOne({ phone: tonumber });

  if (!checkuser) {
    return res.json({
      success: false,
      code: httpStatus.NOT_FOUND,
      message: 'Register with Wowhubb first to get an otp',
    });
  }

  if (checkuser) {
    try {
      const message = await client.messages.create({  // eslint-disable-line
        to: tonumber,
        from: '+1 551-249-0177',
        body: `Your Wowhubb otp is ${otp}`,
      });
      // let sid = message.sid

      await User.findOneAndUpdate({ phone: tonumber }, { $set: { password: otp } });

      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'Request sent',
      });
    } catch (error) {
      return next(error);
    }
  }
}; */


// otp verification


exports.otp = async (req, res, next) => {          // eslint-disable-line
  const otp = Math.floor(Math.random() * 9000) + 1000;
  const { tonumber } = req.body;

  const checkuser = await User.findOne({ phone: tonumber });

  if (!checkuser) {
    return res.json({
      success: false,
      code: httpStatus.FORBIDDEN,
      message: 'Register with Wowhubb first to generate OTP',
    });
  }

  try {
    await User.findOneAndUpdate({ phone: tonumber }, { $set: { otp } });

    const message = await client.messages.create({  // eslint-disable-line
      to: tonumber,
      // from: '+1 551-249-0177',
      from: '+1 872-244-6538',
      body: `Your Wowhubb otp is ${otp}`,
    });
      // let sid = message.sid

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'Otp has been sent to your phone',
    });
  } catch (error) {
    return next(error);
  }
};


/* exports.otp = async (req, res, next) => {          // eslint-disable-line
  const otp = Math.floor(Math.random() * 9000) + 1000;
  const { tonumber } = req.body;

  // const checkuser = await User.findOne({ phone: tonumber });

  try {
      const message = await client.messages.create({  // eslint-disable-line
      to: tonumber,
      from: '+1 551-249-0177',
      body: `Your Wowhubb otp is ${otp}`,
    });
      // let sid = message.sid

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'Otp has been sent to your phone',
      otp,
    });
  } catch (error) {
    return next(error);
  }
}; */


// exports.mailotp = async (req, res, next) => {    // eslint-disable-line
//   const otp = Math.floor(Math.random() * 9000) + 1000;
//   const { toemail } = req.body;

//   const checkuser = await User.findOne({ email: toemail });

//   const mailOptions = {
//     from: 'wowhubbinfo@gmail.com',
//     to: toemail,
//     subject: 'Wowhubb Otp',
//     html: `<b>Your wowhubb otp is <span style="color:blue;">${otp}</span> !</b>`,
//   };

//   if (!checkuser) {
//     return res.json({
//       success: false,
//       code: httpStatus.NOT_FOUND,
//       message: 'Register with Wowhubb first to get an otp',
//     });
//   }


//   if (checkuser) {
//     transporter.sendMail(mailOptions, (error, info) => {     // eslint-disable-line
//       if (error) {
//         return res.json({
//           success: false,
//           message: 'Please try again later',
//         });
//       }

//       /* User.findOneAndUpdate({ email: toemail },{ $set: {password: otp}},(err,done) => {
//           if(err){
//             return res.json({
//               success: false,
//               message: 'Please try again later'
//             })
//           }else{
//             return res.json({
//               success: true,
//               code: httpStatus.OK,
//               message: 'Request sent',
//             })
//           }
//         }); */

//       return res.json({
//         success: true,
//         code: httpStatus.OK,
//         message: 'Otp has been sent to your mail',
//         otp,
//       });
//     });
//   }
// };


exports.mailotp = async (req, res, next) => {    // eslint-disable-line
  const otp = Math.floor(Math.random() * 9000) + 1000;
  const { toemail } = req.body;

  const checkuser = await User.findOne({ email: toemail });

  if (!checkuser) {
    return res.json({
      success: false,
      code: httpStatus.FORBIDDEN,
      message: 'Register with Wowhubb first to generate OTP',
    });
  }

  await User.findOneAndUpdate({ email: toemail }, { $set: { otp } });

  const mailOptions = {
    from: 'wowhubbinfo@gmail.com',
    to: toemail,
    subject: 'Wowhubb Otp',
    html: `<b>Your wowhubb otp is <span style="color:blue;">${otp}</span> !</b>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {     // eslint-disable-line
    if (error) {
      return res.json({
        success: false,
        message: 'Please try again later',
      });
    }


    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'Otp has been sent to your mail',
    });
  });
};


/* exports.mailotp = async (req, res, next) => {    // eslint-disable-line
  const otp = Math.floor(Math.random() * 9000) + 1000;
  const { toemail } = req.body;

  const mailOptions = {
    from: 'wowhubbinfo@gmail.com',
    to: toemail,
    subject: 'Wowhubb Otp',
    html: `<b>Your wowhubb otp is <span style="color:blue;">${otp}</span> !</b>`,
  };

    transporter.sendMail(mailOptions, (error, info) => {     // eslint-disable-line
    if (error) {
      return res.json({
        success: false,
        message: 'Please try again later',
      });
    }


    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'Otp has been sent to your mail',
      otp,
    });
  });
};
 */

exports.signup = async (req, res, next) => {
  try {
    const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

    // await (new User(req.body)).save();
    const { firstname, lastname, phone, email, password, wowtagid } = req.body;

    const user = {
      firstname,
      lastname,
      phone,
      email,
      password,
      wowtagid,
      createdAt,
    };

    const newuser = await (new User(user)).save();

    const userid = newuser._id;

    await User.findByIdAndUpdate(userid, { $push:
      { oldpasswords: { oldpassword: password, createdAt } } });

    // const token = generateTokenResponse(user);
    res.status(httpStatus.CREATED);
    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'Your Account is Created Successfully!!',
      email,
      phone,
    });
  } catch (error) {
    // return next(error);
    return next(User.checkDuplicates(error));
  }
};

exports.verifyotp = async (req, res, next) => {
  try {
    const { email, phone, otp, password } = req.body;

    if (!email) {
      const checkuser = await User.findOne({ phone }, {});
      if (checkuser.otp !== otp) {
        return res.json({
          success: false,
          code: httpStatus.CONFLICT,
          message: 'Wrong OTP',
        });
      } else if (checkuser.password !== password) {
        return res.json({
          success: false,
          code: httpStatus.UNAUTHORIZED,
          message: 'Authentication failed. Wrong Password',
        });
      }
      await User.findOneAndUpdate({ phone }, { otpverify: 'true' });

      const user = {
        _id: checkuser._id,
        firstname: checkuser.firstname,
        lastname: checkuser.lastname,
        email: checkuser.email,
        phone: checkuser.phone,
        birthday: checkuser.birthday,
        gender: checkuser.gender,
        wowtagid: checkuser.wowtagid,
        firsttime: checkuser.firsttime,
        personalimageurl: checkuser.personalimageurl,
        personalselfurl: checkuser.personalselfurl,
        friendrequestreceived: checkuser.friendrequestreceived,
        friendrequestsent: checkuser.friendrequestsent,
        friends: checkuser.friends,
        designation: checkuser.designation,
      };

      const token = generateTokenResponse(user);

      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'OTP Verified!',
        user,
        token,
      });
    }
    const checkuser = await User.findOne({ email }, {});
    if (checkuser.otp !== otp) {
      return res.json({
        success: false,
        code: httpStatus.CONFLICT,
        message: 'Wrong OTP',
      });
    } else if (checkuser.password !== password) {
      return res.json({
        success: false,
        code: httpStatus.UNAUTHORIZED,
        message: 'Authentication failed. Wrong Password',
      });
    }
    await User.findOneAndUpdate({ email }, { otpverify: 'true' });

    const user = {
      _id: checkuser._id,
      firstname: checkuser.firstname,
      lastname: checkuser.lastname,
      email: checkuser.email,
      phone: checkuser.phone,
      birthday: checkuser.birthday,
      gender: checkuser.gender,
      wowtagid: checkuser.wowtagid,
      firsttime: checkuser.firsttime,
      personalimageurl: checkuser.personalimageurl,
      personalselfurl: checkuser.personalselfurl,
      friendrequestreceived: checkuser.friendrequestreceived,
      friendrequestsent: checkuser.friendrequestsent,
      friends: checkuser.friends,
      designation: checkuser.designation,
    };

    const token = generateTokenResponse(user);

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'OTP Verified!',
      token,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

exports.emaillogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const checkuser = await User.findOne({ email })
      .populate('friends', 'wowtagid personalimageurl firstname lastname')
      .populate('friendrequestsent', 'wowtagid personalimageurl firstname lastname')
      .populate('friendrequestreceived', 'wowtagid personalimageurl firstname lastname')
      .populate('business', 'companyname')
      .populate('eventservice', 'companyname')
      .populate('eventvenue', 'companyname');


    if (!checkuser) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Authentication failed. User not found',
      });
    } else if (checkuser.password !== password) {
      return res.json({
        success: false,
        code: httpStatus.UNAUTHORIZED,
        message: 'Authentication failed. Wrong Password',
      });
    } else if (checkuser.otpverify === 'false') {
      return res.json({
        success: false,
        code: httpStatus.FORBIDDEN,
        message: 'Otp verification is must',
      });
    }

    const user = {
      _id: checkuser._id,
      firstname: checkuser.firstname,
      lastname: checkuser.lastname,
      email: checkuser.email,
      phone: checkuser.phone,
      birthday: checkuser.birthday,
      gender: checkuser.gender,
      wowtagid: checkuser.wowtagid,
      firsttime: checkuser.firsttime,
      personalimageurl: checkuser.personalimageurl,
      personalselfurl: checkuser.personalselfurl,
      friendrequestreceived: checkuser.friendrequestreceived,
      friendrequestsent: checkuser.friendrequestsent,
      friends: checkuser.friends,
      designation: checkuser.designation,
      business: checkuser.business,
      eventservice: checkuser.eventservice,
      eventvenue: checkuser.eventvenue,
      phonevisible: checkuser.phonevisible,
      emailvisible: checkuser.emailvisible
    };

    const token = generateTokenResponse(user);
    return res.json({
      success: true,
      code: httpStatus.OK,
      token,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    const checkuser = await User.findOne({ phone })
      .populate('friends', 'wowtagid personalimageurl firstname lastname')
      .populate('friendrequestsent', 'wowtagid personalimageurl firstname lastname')
      .populate('friendrequestreceived', 'wowtagid personalimageurl firstname lastname')
      .populate('business', 'companyname')
      .populate('eventservice', 'companyname')
      .populate('eventvenue', 'companyname');


    if (!checkuser) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Authentication failed. User not found',
      });
    } else if (checkuser.password !== password) {
      return res.json({
        success: false,
        code: httpStatus.UNAUTHORIZED,
        message: 'Authentication failed. Wrong Password',
      });
    } else if (checkuser.otpverify === 'false') {
      return res.json({
        success: false,
        code: httpStatus.FORBIDDEN,
        message: 'Otp verification is must',
      });
    }

    const user = {
      _id: checkuser._id,
      firstname: checkuser.firstname,
      lastname: checkuser.lastname,
      email: checkuser.email,
      phone: checkuser.phone,
      birthday: checkuser.birthday,
      gender: checkuser.gender,
      wowtagid: checkuser.wowtagid,
      firsttime: checkuser.firsttime,
      personalimageurl: checkuser.personalimageurl,
      personalselfurl: checkuser.personalselfurl,
      friendrequestreceived: checkuser.friendrequestreceived,
      friendrequestsent: checkuser.friendrequestsent,
      friends: checkuser.friends,
      designation: checkuser.designation,
      business: checkuser.business,
      eventservice: checkuser.eventservice,
      eventvenue: checkuser.eventvenue,
      phonevisible: checkuser.phonevisible,
      emailvisible: checkuser.emailvisible
    };

    const token = generateTokenResponse(user);
    return res.json({
      success: true,
      code: httpStatus.OK,
      token,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

exports.checktagid = async (req, res, next) => {           // eslint-disable-line
  const { tagid } = req.body;
  const checkid = await User.find({ wowtagid: tagid });

  if (checkid.length === 0) {
    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'id is valid',
    });
  } else if (checkid.length >= 1) {
    return res.json({
      success: false,
      code: httpStatus.NOT_FOUND,
      message: 'id already exists',
    });
  }
};

exports.forgetpassword = async (req, res, next) => {  // eslint-disable-line
  try {
    const otp = Math.floor(Math.random() * 9000) + 1000;
    const { email, phone } = req.body;

    if (!email) {
      const checkuser = await User.findOne({ phone });

      if (!checkuser) {
        return res.json({
          success: false,
          code: httpStatus.FORBIDDEN,
          message: 'Register with Wowhubb first to change Password',
        });
      }


      await User.findOneAndUpdate({ phone }, { $set: { otp } });

      const message = await client.messages.create({  // eslint-disable-line
        to: phone,
        // from: '+1 551-249-0177',
        from: '+1 872-244-6538 ',
        body: `Your Wowhubb otp for changing password is ${otp}`,
      });
      // let sid = message.sid

      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'Otp has been sent to your phone',
      });
    }


    const checkuser = await User.findOne({ email });

    if (!checkuser) {
      return res.json({
        success: false,
        code: httpStatus.FORBIDDEN,
        message: 'Register with Wowhubb first to change Password',
      });
    }

    await User.findOneAndUpdate({ email }, { $set: { otp } });

    const mailOptions = {
      from: 'wowhubbinfo@gmail.com',
      to: email,
      subject: 'Wowhubb Otp',
      html: `<b>Your wowhubb otp for changing password is <span style="color:blue;">${otp}</span> !</b>`,
    };

      transporter.sendMail(mailOptions, (error, info) => {     // eslint-disable-line
      if (error) {
        return res.json({
          success: false,
          message: 'Please try again later',
        });
      }


      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'Otp has been sent to your mail',
      });
    });
  } catch (error) {
    return next(error);
  }
};

exports.changepassword = async (req, res, next) => {
  try {
    const { email, phone, otp, newpassword } = req.body;

    const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

    if (!email) {
      const checkuser = await User.findOne({ phone });

      const checkoldpassword = await User.find({ email,
        'oldpasswords.oldpassword': newpassword }, { 'oldpasswords.$': 1 });

      if (!checkuser) {
        return res.json({
          success: false,
          code: httpStatus.FORBIDDEN,
          message: 'Register with wowhubb first to change Password',
        });
      } else if (checkuser.otp !== otp) {
        return res.json({
          success: false,
          code: httpStatus.CONFLICT,
          message: 'Wrong OTP',
        });
      } else if (checkoldpassword.length !== 0) {
        return res.json({
          success: false,
          code: httpStatus.CONFLICT,
          message: 'Password has been used before',
        });
      }

      await User.findOneAndUpdate({ phone }, { password: newpassword });

      await User.findOneAndUpdate({ email }, { $push:
        { oldpasswords: { oldpassword: newpassword, createdAt } } });

      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'Your password has been changed successfully',
      });
    }

    const checkuser = await User.findOne({ email });

    const checkoldpassword = await User.find({ email,
      'oldpasswords.oldpassword': newpassword }, { 'oldpasswords.$': 1 });

    if (!checkuser) {
      return res.json({
        success: false,
        code: httpStatus.FORBIDDEN,
        message: 'Register with wowhubb first to change Password',
      });
    } else if (checkuser.otp !== otp) {
      return res.json({
        success: false,
        code: httpStatus.CONFLICT,
        message: 'Wrong OTP',
      });
    } else if (checkoldpassword.length !== 0) {
      return res.json({
        success: false,
        code: httpStatus.CONFLICT,
        message: 'Password has been used before',
      });
    }

    await User.findOneAndUpdate({ email }, { password: newpassword });

    await User.findOneAndUpdate({ email }, { $push:
      { oldpasswords: { oldpassword: newpassword, createdAt } } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'Your password has been changed successfully',
    });
  } catch (error) {
    return next(error);
  }
};

exports.addversion = async (req, res, next) => {
  try {
    const { version } = req.body;
    const newversion = await (new Version({ version })).save();

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: newversion,
    });
  } catch (error) {
    return next(error);
  }
};


// TODO - change this
exports.updateversion = async (req, res, next) => {
  try {
    const { oldversion, newversion } = req.body;

    const currentversion = Version.findOne({ oldversion });

    if (currentversion.length === 0) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Version not exists',
      });
    }

    await Version.findOneAndUpdate({ version: oldversion }, { $set: { version: newversion } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: `Version has been successfully updated to ${newversion}`,
    });
  } catch (error) {
    return next(error);
  }
};

exports.checkversion = async (req, res, next) => {
  try {
    const { version } = req.body;

    const currentversion = await Version.find({ version });

    if (currentversion.length === 1) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'Same version',
      });
    } else if (currentversion.length === 0) {
      return res.json({
        success: false,
        code: httpStatus.CONFLICT,
        message: 'Wrong version',
      });
    }

    return res.json({
      success: false,
      code: httpStatus.CONFLICT,
      message: 'Wrong version',
    });
  } catch (error) {
    return next(error);
  }
};

