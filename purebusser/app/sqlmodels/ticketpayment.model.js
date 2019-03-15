const sequelize = require('../config/sequelize').sequelize;
const Sequelize = require('sequelize');

const User = require('./user.model');

const TicketPayment = sequelize.define('ticketpayment',{
    ticketpaymentid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id:{
        type: Sequelize.STRING,
    },
    entity:{
        type: Sequelize.STRING,
    },
    amount:{
        type: Sequelize.STRING,
    },
    currency:{
        type: Sequelize.STRING,
    },
    status:{
        type: Sequelize.STRING,
    },
    order_id:{
        type: Sequelize.STRING,
    },
    invoice_id:{
        type: Sequelize.STRING,
    },
    international:{
        type: Sequelize.STRING,
    },
    method:{
        type: Sequelize.STRING,
    },
    amount_refunded:{
        type: Sequelize.STRING,
    },
    refund_status:{
        type: Sequelize.STRING,
    },
    captured:{
        type: Sequelize.STRING,
    },
    description:{
        type: Sequelize.STRING,
    },
    card_id:{
        type: Sequelize.STRING,
    },
    card_entity:{
        type: Sequelize.STRING,
    },
    card_name:{
        type: Sequelize.STRING,
    },
    card_last4:{
        type: Sequelize.STRING,
    },
    card_network:{
        type: Sequelize.STRING,
    },
    card_type:{
        type: Sequelize.STRING,
    },
    card_issuer:{
        type: Sequelize.STRING,
    },
    card_international:{
        type: Sequelize.STRING,
    },
    card_emi:{
        type: Sequelize.STRING,
    },
    bank:{
        type: Sequelize.STRING,
    },
    wallet1:{
        type: Sequelize.STRING,
    },
    vpa:{
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
    fee:{
        type: Sequelize.STRING,
    },
    tax:{
        type: Sequelize.STRING,
    },
    error_code:{
        type: Sequelize.STRING,
    },
    error_description:{
        type: Sequelize.STRING,
    },
    created_at:{
        type: Sequelize.STRING,
    }
})

TicketPayment.belongsTo(User,{foreignKey: 'userid'})
User.hasMany(TicketPayment,{foreignKey: 'userid', sourceKey: 'userid'})

module.exports = TicketPayment;