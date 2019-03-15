const sequelize = require('../config/sequelize').sequelize;
const Sequelize = require('sequelize');

const User = require('./user.model')
const Coupon = require('./coupon.model')

const CouponUsage = sequelize.define('couponusage',{
    couponusageid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    discountvalueinrupees: {
        type: Sequelize.INTEGER
    },
    couponstatus: {
        type: Sequelize.INTEGER
    }
})

CouponUsage.belongsTo(User,{foreignKey: 'userid'})
User.hasMany(CouponUsage,{foreignKey: 'userid', sourceKey: 'userid'})

CouponUsage.belongsTo(Coupon,{foreignKey: 'couponid'})
Coupon.hasMany(CouponUsage,{foreignKey: 'couponid', sourceKey: 'couponid'})




module.exports = CouponUsage;