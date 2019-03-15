const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const helmet = require('helmet');
const passport = require('passport');
const routes = require('../routes/index');
const adminJwtStrategy = require('./admin.passport');
const employerJwtStrategy = require('./employer.passport');
const jobseekerJwtStrategy = require('./jobseeker.passport');
const error = require('../../app/middlewares/error');
const cors = require('cors');
const momenttz = require('moment-timezone');

morgan.token('date', (req, res, tz) => momenttz().tz(tz).format('DD/MMM/YYYY:HH:mm:ss Z'));

morgan.format('format', `:remote-addr - :remote-user [:date[${momenttz.tz.guess()}]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms ":referrer" ":user-agent"`);

const app = express();

app.use(cors());
app.use(morgan('format'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(compress());
app.use(methodOverride());

app.use(helmet());

app.use(passport.initialize());
passport.use('adminjwt', adminJwtStrategy);
passport.use('employerjwt', employerJwtStrategy);
passport.use('jobseekerjwt', jobseekerJwtStrategy);

app.use('/ooget', routes);

app.use(error.converter);
app.use(error.notFound);
app.use(error.handler);

module.exports = app;
