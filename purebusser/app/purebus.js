Promise = require('bluebird'); // eslint-disable-line

const { port, env } = require('./config/vars');
const app = require('./config/express');
// const mongoose = require('./config/mongoose');

// mongoose.connect();

const sequelize = require('./config/sequelize');
sequelize.connect();

app.listen(port, () => console.info(`server started on port ${port} (${env})`));

module.exports = app;
