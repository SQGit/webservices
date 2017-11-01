const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const User = require('../models/user.model');
const { jwtSecret, accountSid, authToken } = require('../config/vars');
const transporter = require('../middlewares/mail');

const Test = require('../models/test.model');

const client = twilio(accountSid, authToken);

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


// just otp no. verification

exports.otp = async (req, res, next) => {          // eslint-disable-line
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
};


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


exports.signup = async (req, res, next) => {
  try {
    const user = await (new User(req.body)).save();
    const token = generateTokenResponse(user);
    res.status(httpStatus.CREATED);
    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'User has been created',
      token,
    });
  } catch (error) {
    // return next(error);
    return next(User.checkDuplicates(error));
  }
};

exports.emaillogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const checkuser = await User.findOne({ email });

    if (!checkuser) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Authentication failed. User not found',
      });
    }

    if (checkuser.password !== password) {
      return res.json({
        success: false,
        code: httpStatus.UNAUTHORIZED,
        message: 'Authentication failed. Wrong Password',
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

    const checkuser = await User.findOne({ phone });

    if (!checkuser) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Authentication failed. User not found',
      });
    }

    if (checkuser.password !== password) {
      return res.json({
        success: false,
        code: httpStatus.UNAUTHORIZED,
        message: 'Authentication failed. Wrong Password',
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

