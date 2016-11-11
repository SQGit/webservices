var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit : 100,
    host : 'localhost',
    user : 'root',
    database : 'movehaul'
});

module.exports = pool;