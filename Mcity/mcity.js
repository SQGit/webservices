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
var Auto = require('./app/models/auto');
var Restaurant = require('./app/models/restaurant');
var Retail = require('./app/models/retail');
var Revtrain = require('./app/models/revtrain');
var Version = require('./app/models/version');
var Ceas = require('./app/models/ceas');
var Sell = require('./app/models/sell');

var Parche = require('./app/models/parche');
var Ride = require('./app/models/ride');
var Rent = require('./app/models/rent');
var Room = require('./app/models/room');

var Admin = require('./app/models/admin');

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
app.use('/mcity',express.static('public'));

app.use('/uploads',express.static(__dirname + '/uploads'));

app.use('/img',express.static(__dirname + 'C:/wamp64/www/mcity/assets/img'))

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

require('./app/routes.js')(app);


app.listen(port);
console.log('Magic happens at http://localhost:' + port);
