const sequelize = require('../config/sequelize').sequelize;
const Sequelize = require('sequelize');

const Coupon = sequelize.define('coupon',{
    couponid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    couponcode: {
        type: Sequelize.STRING
    },
    discountvalueinrupees: {
        type: Sequelize.INTEGER
    },
    discountvalueinpercentage: {
        type: Sequelize.INTEGER
    },
    maximumvalueinrupees: {
        type: Sequelize.INTEGER
    },
    validfrom: {
        type: Sequelize.INTEGER
    },
    validtill: {
        type: Sequelize.INTEGER
    },
    usagelimit: {
        type: Sequelize.INTEGER
    }
})


module.exports = Coupon;