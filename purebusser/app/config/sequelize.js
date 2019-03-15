const Sequelize = require('sequelize');
const { env } = require('./vars');

const sequelize = new Sequelize('purebus','hari','1234',{
    host: 'localhost',
    dialect: 'mysql',
    operatorsAliases: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    timezone: '+05:30',
    logging: false
})


sequelize
    .authenticate()
    .then(() => {
        console.log('Database connection established successfully')
    })
    .catch(err => {
        console.error('Datbase connection failed')
        process.exit(-1);
    })

exports.connect = () => {
    return sequelize.authenticate()
}

exports.sequelize = sequelize