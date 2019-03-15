const sequelize = require('../config/sequelize').sequelize;
const Sequelize = require('sequelize');

const Book = require('./book.model');

const Inventory = sequelize.define('inventory',{
    inventoryId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fare: {
        type: Sequelize.STRING
    },
    ladiesSeat: {
        type: Sequelize.STRING
    },
    malesSeat: {
        type: Sequelize.STRING
    },
    operatorServiceCharge: {
        type: Sequelize.STRING
    },
    seatName: {
        type: Sequelize.STRING
    },
    serviceTax: {
        type: Sequelize.STRING
    },
    primary: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    },
    mobile: {
        type: Sequelize.STRING
    },
    title: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    age: {
        type: Sequelize.INTEGER
    },
    gender: {
        type: Sequelize.STRING
    }
})

Inventory.belongsTo(Book, {foreignKey: 'bookingid'})
Book.hasMany(Inventory,{foreignKey: 'bookingid', sourceKey: 'bookingid'})

module.exports = Inventory;