const sequelize = require('../config/sequelize').sequelize;
const Sequelize = require('sequelize');

const Basefare = sequelize.define('basefare',{
    basefareid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fareinpercentage: {
        type: Sequelize.INTEGER
    },
    fareinrupees: {
        type: Sequelize.INTEGER
    }
})


module.exports = Basefare;