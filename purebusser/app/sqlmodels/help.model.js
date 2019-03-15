const sequelize = require('../config/sequelize').sequelize;
const Sequelize = require('sequelize');

const User = require('./user.model');

const Help = sequelize.define('help',{
    helpid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    comments: {
        type: Sequelize.STRING
    }
})

Help.belongsTo(User, {foreignKey: 'userid'})
User.hasMany(Help,{foreignKey: 'userid', sourceKey: 'userid'})

module.exports = Help;