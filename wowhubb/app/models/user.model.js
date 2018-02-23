const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const APIError = require('../utils/APIError');
const MYError = require('../utils/MYError');

const workExperience = new mongoose.Schema({
  title: { type: String },
  company: { type: String },
  location: { type: String },
  frommonth: { type: String },
  tomonth: { type: String },
  fromyear: { type: String },
  toyear: { type: String },
  description: { type: String },
  link: { type: String },
});

const Relationship = new mongoose.Schema({
  relation: { type: String },
  name: { type: String },
});


const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    trim: true,
  },
  wowtagid: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    // required: true,
  },
  gender: {
    type: String,
    trim: true,
  },
  birthday: {
    type: String,
    trim: true,
  },
  interests: {
    type: Array,
  },
  personalimage: {
    type: String,
  },
  personalcover: {
    type: String,
  },
  personalself: {
    type: String,
  },
  place: {
    type: String,
  },
  maritalstatus: {
    type: String,
  },
  wedding: {
    type: String,
  },
  socialfunction: {
    type: String,
  },
  parties: {
    type: String,
  },
  anniversary: {
    type: String,
  },
  aboutme: {
    type: String,
  },
  createdAt: { type: String },
  quote: { type: String },
  religion: { type: String },
  language: { type: String },
  country: { type: String },
  state: { type: String },
  sociallinks: { type: String },
  designation: { type: String },
  education: { type: Array },
  workexperience: [workExperience],
  workplace: { type: String },
  certification: { type: Array },
  volunteer: { type: Array },
  firsttime: {
    type: String,
    default: 'true',
  },
  otpverify: {
    type: String,
    default: 'false',
  },
  otp: { type: String },
  relationship: [Relationship],
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  friendrequestsent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  friendrequestreceived: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
});


userSchema.statics = {


  checkDuplicates(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      const regex = /index\:\ (?:.*\.)?\$?(?:([_a-z0-9]*)(?:_\d*)|([_a-z0-9]*))\s*dup key/i, // eslint-disable-line
        match = error.message.match(regex),
        field = match[1] || match[2];

      // return new APIError({
      //   message: `${field} exists already`,
      //   errors: [{
      //     field,
      //     message: 'Validation error',
      //   }],
      //   status: httpStatus.CONFLICT,
      //   isPublic: true,
      //   // stack: error.stack,
      // });

      return new MYError({
        message: `${field} exists already`,
        success: false,
        errors: [{
          field,
          message: 'Validation error',
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
        // stack: error.stack,
      });
    }
    return error;
  },
};


module.exports = mongoose.model('user', userSchema);

