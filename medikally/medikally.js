var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var config = require('./config');

var port = process.env.PORT || 3022;

app.set('superSecret',config.secret);

app.use(express.static('public'));
app.use('/medikally',express.static('public'));

app.use('/public',express.static(__dirname + '/public'));

app.use('/img',express.static(__dirname + 'C:/wamp64/www/medikally/assets/img'))
app.use('/videos',express.static(__dirname + 'C:/wamp64/www/medikally/assets/videos'))

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

require('./app/routes/routes.js')(app);

app.listen(port);
console.log('Server running at http://localhost:' + port);