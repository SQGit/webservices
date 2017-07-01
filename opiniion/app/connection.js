var mysql = require('mysql');

// var pool = mysql.createPool({
//     connectionLimit : 100,
//     host : '127.0.0.1',
//     user : 'root',
//     password: 'XqPXbePRLVeKchyU',
//     database : 'opiniion'
// });

var pool = mysql.createPool({
    connectionLimit : 100,
    host : '50.62.209.119',
    user : 'opiniionuser',
    password: 'wTh@l007',
    database : 'opiniion'
});

module.exports = pool;