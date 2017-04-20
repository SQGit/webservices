let express = require('express');
let app = express();
let path = require('path');
let mongoose = require('mongoose');
let morgan = require('morgan');
let cors = require('cors');
let bodyParser = require('body-parser');

let port = 3025;

let config = require('config');

let options = {
    user: "Hari",
    pwd: "123",
    auth: {
        authdb: "admin"
    },
    server: { socketOptions: { KeepAlive: 1, connectTimeOutMS: 30000 }},
    replset: { socketOptions: { KeepAlive: 1, connectTimeOutMS: 30000 }}
};


mongoose.connect(config.DBHOST,options);
let db = mongoose.connection;

db.on('error',console.error.bind(console,'connection error:'));

app.use(cors());
app.set('superSecret',config.secret);
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type: 'application/json'}));

app.use(morgan('dev'));


require('./app/routes/admin')(app);

app.listen(port);
console.log("Listening on port " + port);

module.exports = app;


