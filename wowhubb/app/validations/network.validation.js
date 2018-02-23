const Joi = require('joi');

module.exports = {

  sendRequest: {
    body: {
      userid: Joi.string().min(1).required(),
    },
  },
  declineRequest: {
    body: {
      userid: Joi.string().min(1).required(),
    },
  },
  acceptRequest: {
    body: {
      userid: Joi.string().min(1).required(),
    },
  },

};
