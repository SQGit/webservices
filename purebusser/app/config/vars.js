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
      socketTimeoutMS: 30000,
      keepAlive: true,
      reconnectTries: 30,
    },
  },
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
};
