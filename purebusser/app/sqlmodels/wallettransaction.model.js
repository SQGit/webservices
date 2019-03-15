const sequelize = require('../config/sequelize').sequelize;
const Sequelize = require('sequelize');

const Wallet = require('./wallet.model');

const WalletTransaction = sequelize.define('wallettransaction',{
    wallettransactionid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    transactiontype: {
        type: Sequelize.STRING
    },
    balancechange: {
        type: Sequelize.INTEGER
    },
    description: {
        type: Sequelize.STRING
    },
    commission: {
        type: Sequelize.INTEGER
    }
})

WalletTransaction.belongsTo(Wallet,{foreignKey: 'walletid'})
Wallet.hasMany(WalletTransaction,{foreignKey: 'walletid', sourceKey: 'walletid'})

module.exports = WalletTransaction;