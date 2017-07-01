var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var path = require('path');

var jwt = require('jsonwebtoken');
var config = require('./config');


var port = process.env.PORT || 3030;

app.set('superSecret',config.secret);

app.use(express.static('public'));
app.use('/uploads',express.static(__dirname + '/uploads'));
app.use('/palitana',express.static(__dirname + '/public'))

app.use('/img',express.static(__dirname + 'C:/wamp64/www/movehaul/assets/img'));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

require('./app/routes/customer.js')(app);
require('./app/routes/truckdriver.js')(app);
require('./app/routes/busdriver.js')(app);
require('./app/routes/assistance.js')(app);
require('./app/routes/admin.js')(app);
require('./app/routes/agent.js')(app);
require('./app/routes/demo.js')(app);

app.listen(port);
console.log("Server running at http://localhost:" + port);