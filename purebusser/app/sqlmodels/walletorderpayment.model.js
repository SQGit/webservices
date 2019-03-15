const sequelize = require('../config/sequelize').sequelize;
const Sequelize = require('sequelize');

const Wallet = require('./wallet.model');

const WalletOrderPayment = sequelize.define('walletorderpayment',{
    walletorderpaymentid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderid: {
        type: Sequelize.STRING
    },
    paymentid:{
        type: Sequelize.STRING,
    },
    entity:{
        type: Sequelize.STRING,
    },
    amount:{
        type: Sequelize.STRING,
    },
    amountpaid: {
        type: Sequelize.STRING
    },
    amountdue: {
        type: Sequelize.STRING
    },
    currency:{
        type: Sequelize.STRING,
    },
    receipt: {
        type: Sequelize.STRING
    },
    offerid: {
        type: Sequelize.STRING
    },
    status:{
        type: Sequelize.STRING,
    },
    attempts: {
        type: Sequelize.STRING,
    },
    description:{
        type: Sequelize.STRING,
    },
    email:{
        type: Sequelize.STRING,
    },
    contact:{
        type: Sequelize.STRING,
    },
    notes:{
        type: Sequelize.STRING,
    },
    created_at:{
        type: Sequelize.STRING,
    }
})

WalletOrderPayment.belongsTo(Wallet,{foreignKey: 'walletid'})
Wallet.hasMany(WalletOrderPayment,{foreignKey: 'walletid', sourceKey: 'walletid'})

module.exports = WalletOrderPayment;