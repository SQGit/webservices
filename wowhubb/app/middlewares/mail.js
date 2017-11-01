const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'wowhubbinfo@gmail.com',
    pass: '@Emeka2017',
  },
});

module.exports = transporter;
