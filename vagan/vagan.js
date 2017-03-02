var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');

var jwt = require('jsonwebtoken');
var config = require('./config');

var port = process.env.PORT || 3021;

app.set('superSecret',config.secret);



app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

require('./app/routes/routes.js')(app);


app.listen(port);
console.log('Server running at http://localhost:' + port);