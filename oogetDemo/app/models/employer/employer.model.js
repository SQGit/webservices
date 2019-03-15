const mongoose = require('mongoose');
const httpStatus = require('http-status');
const MYError = require('../../utils/MYError');

const employerSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String },
  password: { type: String },
  companyid: { type: mongoose.Schema.Types.ObjectId, ref: 'company' },
  roleid: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
  rolename: { type: String },
  defaultemployer: { type: Boolean, default: false },
  extrapermissions: { type: Array },
  createdAt: { type: String },
});


employerSchema.statics = {

  checkDuplicates(error) {
    const { name } = error;
    if (name === 'MongoError' && error.code === 11000) {
            const regex = /index\:\ (?:.*\.)?\$?(?:([_a-z0-9]*)(?:_\d*)|([_a-z0-9]*))\s*dup key/i,
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
      });
    } else if (name === 'BulkWriteError' && error.code === 11000) {
            const regex = /index\:\ (?:.*\.)?\$?(?:([_a-z0-9]*)(?:_\d*)|([_a-z0-9]*))\s*dup key/i, 
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
      });
    }
    return error;
  },
};

module.exports = mongoose.model('employer', employerSchema);
