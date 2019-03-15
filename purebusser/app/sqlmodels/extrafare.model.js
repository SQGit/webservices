const sequelize = require('../config/sequelize').sequelize;
const Sequelize = require('sequelize');

const Extrafare = sequelize.define('extrafare',{
    extrafareid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fare: {
        type: Sequelize.INTEGER
    }
})


module.exports = Extrafare;