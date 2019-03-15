const sequelize = require('../config/sequelize').sequelize;
const Sequelize = require('sequelize');

const User = require('./user.model');

const Wallet = sequelize.define('wallet',{
    walletid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    balance: {
        type: Sequelize.INTEGER
    }
})

Wallet.belongsTo(User, {foreignKey: 'userid'})
User.hasOne(Wallet,{foreignKey: 'userid', sourceKey: 'userid'})

module.exports = Wallet;