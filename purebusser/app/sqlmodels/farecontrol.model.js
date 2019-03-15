const sequelize = require('../config/sequelize').sequelize;
const Sequelize = require('sequelize');

const Farecontrol = sequelize.define('farecontrol',{
    farecontrolid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fare: {
        type: Sequelize.INTEGER
    }
})


module.exports = Farecontrol;