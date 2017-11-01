const path = require('path');

require('dotenv-safe').load({
  path: path.join(__dirname, '..', '..', '.env'),
  sample: path.join(__dirname, '..', '..', '.env.example'),
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
  accountSid: process.env.TWILIO_SID,
  authToken: process.env.TWILIO_TOKEN,
  mongo: {
    uri: process.env.NODE_ENV === 'test'
      ? process.env.MONGO_URI_TESTS
      : process.env.MONGO_URI,
    options: {
      user: 'Hari',
      pwd: '123',
      auth: {
        authdb: 'admin',
      },
      server: { socketOptions: { keepAlive: 1, connectTimeOutMS: 30000 } },
      replset: { socketOptions: { keepAlive: 1, connectTimeOutMS: 30000 } },
    },
  },
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
};
