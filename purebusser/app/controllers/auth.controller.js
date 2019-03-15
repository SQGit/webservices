const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { jwtSecret } = require('../config/vars');
const request = require('request');

const moment = require('moment');

function generateTokenResponse(user) {
  const accessToken = jwt.sign(user, jwtSecret, {
    expiresIn: '365 days',
  });
  return accessToken;
}


exports.signup = async (req, res, next) => {
  try {
    const usertype = 'normal';
    const {
      name, email, phone, password,
    } = req.body;
    const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

    const user = {
      name,
      email,
      phone,
      password,
      usertype,
      createdAt,
    };

    await (new User(user)).save();

    res.status(httpStatus.CREATED);
    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'Your Account has been created Successfully!',
    });
  } catch (error) {
    return next(User.checkDuplicates(error));
  }
};

exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const checkuser = await User.findOne({ email });


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
    }

    const user = {
      _id: checkuser._id,
      email: checkuser.email,
      phone: checkuser.phone,
      name: checkuser.name,
      usertype: checkuser.usertype,
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


exports.otp = async (req, res, next) => {          // eslint-disable-line

  try {
    const otp = Math.floor(Math.random() * 9000) + 1000;
    const { tonumber } = req.body;

    const checkuser = await User.findOne({ phone: tonumber });

    if (!checkuser) {
      return res.json({
        success: false,
        code: httpStatus.FORBIDDEN,
        message: 'Register with Purebus first to generate OTP',
      });
    }

    const otpCreatedAt = moment().format('YYYY/MM/DD H:mm:ss');

    const otpValidTill = moment().add('30', 'minutes').format('H:mm:ss');

    await User.findOneAndUpdate({ phone: tonumber }, { $set: { otp, otpCreatedAt } });

    const message = `${otp} is your One Time Password for successfull registration and it's valid till ${otpValidTill} IST. Please do not share this to anyone. Thank you - Purebus`;

    const url = `http://indiabulksms.org/httpapi/v1/sendsms?api-token=946rktp01wnoqxlazb.e!37hgmsyud*58i_fcjv2&numbers=${tonumber}&route=2&message=${message}&sender=PURBUS`;

    await request.get(url);

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'Otp has been sent to your phone',
    });
  } catch (error) {
    return next(error);
  }
};

