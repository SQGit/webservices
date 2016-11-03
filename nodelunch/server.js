var express = require('express');
var https = require('https');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var fs = require('fs');

var morgan = require('morgan');
var bodyParser = require('body-parser');

var app = express();

var port = process.env.PORT || 3020;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(cookieParser('a deep secret'));
app.use(session({secret : '123456789QWERTY'}));

require('./app/routes.js')(app);

app.listen(port);

console.log('Server listening at http://localhost:' + port);
