const sequelize = require('../config/sequelize').sequelize
const Sequelize = require('sequelize');

const User = sequelize.define('user',{
    userid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usertype: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: Sequelize.STRING,
        unique: true
    },
    password: {
        type: Sequelize.TEXT
    },
    otp: {
        type: Sequelize.INTEGER
    },
    otpCreatedAt: {
        type: Sequelize.STRING
    },
})


module.exports = User;