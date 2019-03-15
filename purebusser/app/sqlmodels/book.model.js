const sequelize = require('../config/sequelize').sequelize;
const Sequelize = require('sequelize');

const User = require('./user.model');

const Book = sequelize.define('booking',{
    bookingid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    blockkey: {
        type: Sequelize.STRING
    },
    bookingFee: {
        type: Sequelize.STRING
    },
    busType: {
        type: Sequelize.STRING
    },
    cancellationCharges: {
        type: Sequelize.STRING
    }, //no need
    cancellationPolicy: {
        type: Sequelize.STRING
    },
    dateOfCancellation: {
        type: Sequelize.STRING
    },    //no need
    dateOfIssue: {
        type: Sequelize.STRING
    },
    destinationCity: {
        type: Sequelize.STRING
    },
    destinationCityId: {
        type: Sequelize.STRING
    },
    doj: {
        type: Sequelize.STRING
    },
    dropLocation: {
        type: Sequelize.STRING
    },
    dropLocationId: {
        type: Sequelize.STRING
    },
    dropTime: {
        type: Sequelize.STRING
    },
    hasRTCBreakup: {
        type: Sequelize.STRING
    },
    hasSpecialTemplate: {
        type: Sequelize.STRING
    },
    inventoryId: {
        type: Sequelize.STRING
    },
    MTicketEnabled: {
        type: Sequelize.STRING
    },
    partialCancellationAllowed: {
        type: Sequelize.STRING
    },
    pickUpContactNo: {
        type: Sequelize.STRING
    },
    pickUpLocationAddress: {
        type: Sequelize.STRING
    },
    pickupLocation: {
        type: Sequelize.STRING
    },
    pickupLocationId: {
        type: Sequelize.STRING
    },
    pickupLocationLandmark: {
        type: Sequelize.STRING
    },
    pickupTime: {
        type: Sequelize.STRING
    },
    pnr: {
        type: Sequelize.STRING
    },
    primeDepartureTime: {
        type: Sequelize.STRING
    },
    refundAmount: {
        type: Sequelize.STRING
    },  //no need
    serviceCharge: {
        type: Sequelize.STRING
    },
    sourceCity: {
        type: Sequelize.STRING
    },
    sourceCityId: {
        type: Sequelize.STRING
    },
    status: {
        type: Sequelize.STRING
    },
    tin: {
        type: Sequelize.STRING
    },
    travels: {
        type: Sequelize.STRING
    },
    purebusfare: {
        type: Sequelize.STRING
    },
    coupondiscountinrupees: {
        type: Sequelize.STRING
    },
    razorpayamountused: {
        type: Sequelize.STRING
    },
    walletamountused: {
        type: Sequelize.STRING
    }
})


Book.belongsTo(User,{foreignKey: 'userid'})
User.hasMany(Book,{foreignKey: 'userid', sourceKey: 'userid'})


module.exports = Book;






