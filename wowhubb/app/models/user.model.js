const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const APIError = require('../utils/APIError');
const MYError = require('../utils/MYError');

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
  firsttime: {
    type: String,
    default: 'true',
  },
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

