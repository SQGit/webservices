var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./app/models/user');


var options = {
    user : "Hari",
    pwd : "123",
    auth : {
        authdb:'admin'
    }
};

var port = process.env.PORT  || 3010;
mongoose.connect(config.database,options);
app.set('superSecret',config.secret);

app.use(express.static('public'));

app.use('/complaint',express.static(__dirname + '/complaint'));
app.use('/user',express.static(__dirname + '/user'));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(morgan('dev'));
require('./app/routes.js')(app);

app.listen(port);
console.log("Server running at http:// localhost:" + port);