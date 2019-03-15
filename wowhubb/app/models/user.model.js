const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const APIError = require('../utils/APIError');
const MYError = require('../utils/MYError');

const workExperience = new mongoose.Schema({
  title: { type: String },
  company: { type: String },
  location: { type: String },
  fromyear: { type: String },
  toyear: { type: String },
  description: { type: String }
});

const Relationship = new mongoose.Schema({
  relation: { type: String },
  name: { type: String },
});

const OldPassword = new mongoose.Schema({
  oldpassword: { type: String },
  createdAt: { type: String },
});

const OldPersonal = new mongoose.Schema({
  oldpersonalimageurl: {type: String},
  createdAt: { type: String },
})

const Certification = new mongoose.Schema({
  year: { type : String},
  certification: {type: String}
})

const College = new mongoose.Schema({
  college: { type : String},
  from: {type: String},
  to: {type: String},
  degree: {type: String},
  field: {type: String},
  grade: {type: String},
  description: {type: String},
})


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
  phonevisible: {type: String, default: 'enabled'},
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  emailvisible: {type: String, default: 'enabled'},
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
  personalimageurl: {type: String},
  oldpersonalimageurls: [OldPersonal],
  personalimagethumb: {type: String},
  personalcover: {
    type: String,
  },
  personalcoverurl: { type: String },
  personalcoverthumb: {type: String },
  personalself: {
    type: String,
  },
  personalselfurl: { type: String },
  personalselfthumb: { type: String },
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
  professionalskills: {type: Array},
  createdAt: { type: String },
  quote: { type: String },
  religion: { type: String },
  language: { type: String },
  country: { type: String },
  state: { type: String },
  sociallinks: { type: Array },
  designation: { type: String },
  education: { type: Array },
  workexperience: [workExperience],
  workplace: { type: String },
  certification: [Certification],
  college: [College],
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
  relationshipstatus: {type: String},
  relationshipwith: {type: String},
  oldpasswords: [OldPassword],
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
  business: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'business',
    },
  ],
  eventservice: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'eventservice',
    },
  ],
  eventvenue: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'eventvenue',
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

