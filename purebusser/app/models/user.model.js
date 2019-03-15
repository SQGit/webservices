const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const APIError = require('../utils/APIError');
const MYError = require('../utils/MYError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
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
    required: true,
  },
  usertype: {
    type: String,
  },
  otp: {
    type: String,
  },
  otpCreatedAt: {
    type: String,
  },
  createdAt: {
    type: String,
  },
});


userSchema.statics = {


  checkDuplicates(error) {
    const { name } = error;
    if (name === 'MongoError' && error.code === 11000) {
      const regex = /index\:\ (?:.*\.)?\$?(?:([_a-z0-9]*)(?:_\d*)|([_a-z0-9]*))\s*dup key/i, // eslint-disable-line
        match = error.message.match(regex),
        field = match[1] || match[2];

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
    } else if (name === 'BulkWriteError' && error.code === 11000) {
      const regex = /index\:\ (?:.*\.)?\$?(?:([_a-z0-9]*)(?:_\d*)|([_a-z0-9]*))\s*dup key/i, // eslint-disable-line
        match = error.message.match(regex),
        field = match[1] || match[2];

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

