var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan')
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./app/models/user');
var Train = require('./app/models/train');
var Coupon = require('./app/models/coupon');

var options = {
    user : "Hari",
    pwd : "123",
    auth : {
        authdb:'admin'
    }
};

var port = process.env.PORT || 3000;
mongoose.connect(config.database,options);
app.set('superSecret',config.secret);

app.use(express.static('public'));

app.use('/uploads',express.static(__dirname + '/uploads'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

require('./app/routes.js')(app);


app.listen(port);
console.log('Magic happens at http://localhost:' + port);
