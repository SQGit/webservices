const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const helmet = require('helmet');
const passport = require('passport');
const routes = require('../../app/routes/v1');
const { logs } = require('./vars');
const jwtStrategy = require('./passport');
const error = require('../../app/middlewares/error');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(morgan(logs));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(compress());
app.use(methodOverride());

app.use(helmet());


app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

app.use('/pure', routes);

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);
// catch 404 and forward to error handler
app.use(error.notFound);
// error handler, send stacktrace only during development
app.use(error.handler);

module.exports = app;
