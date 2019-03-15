const sequelize = require('../config/sequelize').sequelize;
const Sequelize = require('sequelize');

const TopCity = sequelize.define('topcity',{
    topcityid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cityname: {
        type: Sequelize.STRING
    },

})


module.exports = TopCity;