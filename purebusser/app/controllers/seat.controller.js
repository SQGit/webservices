const httpStatus = require('http-status');
const request = require('request');
const ExtraFare = require('../sqlmodels/extrafare.model');
const BaseFare = require('../sqlmodels/basefare.model');
const Coupon = require('../sqlmodels/coupon.model');
const CouponUsage = require('../sqlmodels/couponusage.model');
const TopCity = require('../sqlmodels/topcity.model');

const User = require('../sqlmodels/user.model')

const { Op } = require('sequelize')
const moment = require('moment');


exports.fetchcoupons = async(req, res, next) => {
  try {

    const currentdate = moment().format('YYYY-MM-DD');
    
    await Coupon.findAll({where: {
      validfrom: {
        [Op.lt]: currentdate
      },
      validtill: {
        [Op.gte]: currentdate
      }
    }})
      .then(coupons => {
        return res.json({
          success: true,
          coupons
        })
      })
      .catch(error => {
        console.log(error);
      })

  } catch (error) {
    return next(error)
  }
}

exports.fetchextrafare = async(req, res, next) => {
  try {
    
    await ExtraFare.findOne({where: {extrafareid: 1}})
      .then(extrafare => {
        return res.json({
          success: true,
          extrafare
        })
      })
      .catch(error => {
        console.log(error);
      })

  } catch (error) {
    return next(error)
  }
}

exports.fetchbasefare = async(req, res, next) => {
  try {
    
    await BaseFare.findOne({where: {basefareid: 1}})
      .then(basefare => {
        let inPercentage = basefare.fareinpercentage;
        let inRupees = basefare.fareinrupees;
        
        return res.json({
          success: true,
          inPercentage,
          inRupees
        })

        
      })
      .catch(error => {
        console.log(error);
      })

  } catch (error) {
    return next(error)
  }
}

exports.fetchtopcities = async(req, res, next) => {
  try {
    
    await TopCity.findAll({})
      .then(topcities => {
        return res.json({
          success: true,
          topcities
        })
      })
      .catch(error => {
        console.log(error);
      })

  } catch (error) {
    return next(error)
  }
}


/* exports.checkcoupon = async(req, res, next) => {
  try {

    const {couponcode,amount} = req.body;

    const currentdate = moment().format('YYYY-MM-DD');


    await Coupon.findOne({where: {
      couponcode,
      validfrom: {
        [Op.lt]: currentdate
      },
      validtill: {
        [Op.gte]: currentdate
      }
    }})
    .then(coupon => {

      if(coupon === null){
        return res.json({
          success: false,
          message: 'Invalid Coupon Code'
        })
      }else{

        let inRupees = coupon.discountvalueinrupees;
        let inPercentage = coupon.discountvalueinpercentage;
        let maximumAmount = coupon.maximumvalueinrupees;

     
          if(inRupees !== null){

            let finalfare = amount - inRupees

            return res.json({
              success: true,
              finalfare,
              message: 'Congratulation.You got a Discount of ' + inRupees
            })
          }else if(inPercentage !== null){

            let inCurrency = amount * (inPercentage / 100);

            let finalInRupees = (inCurrency < maximumAmount) ? inCurrency : maximumAmount

            let finalfare = amount - finalInRupees

            return res.json({
              success: true,
              finalfare,
              message: 'Congratulation.You got a Discount of ' + finalInRupees
            })
          }

      }    

    })
    .catch(error => {
      console.log(error);
    })

  } catch (error) {
    return next(error)
  }
} */


exports.checkcoupon = async (req, res, next) => {
  try {

    const userid = req.user.userid;
    const {couponcode,amount} = req.body;

    const currentdate = moment().format('YYYY-MM-DD');


    await Coupon.findOne({where: {
      couponcode,
      validfrom: {
        [Op.lt]: currentdate
      },
      validtill: {
        [Op.gte]: currentdate
      }
    }})
    .then(async (coupon) => {

      if(coupon === null){
        return res.json({
          success: false,
          message: 'Invalid Coupon Code'
        })
      }else{

        let inRupees = coupon.discountvalueinrupees;
        let inPercentage = coupon.discountvalueinpercentage;
        let maximumAmount = coupon.maximumvalueinrupees;
        
        let couponid = coupon.couponid;
        let usagelimit = parseInt(coupon.usagelimit,10);

        const couponsused = await CouponUsage.count({where: {
          userid,
          couponid
        }})


        if((usagelimit > 1) && (usagelimit <= couponsused)){
          
          return res.json({
            success: false,
            message: 'You have already reached the limit'
          })
        
        }else if(usagelimit !== null){

            if(inRupees !== null){

              let discountvalueinrupees = parseInt(inRupees,10)

              let finalfare = amount - inRupees
    
              return res.json({
                success: true,
                finalfare,
                message: 'Congratulation.You got a Discount of ' + inRupees,
                discountvalueinrupees,
                couponid
              })
            }else if(inPercentage !== null){
    
              let inCurrency = amount * (inPercentage / 100);
    
              let finalInRupees = (inCurrency < maximumAmount) ? inCurrency : maximumAmount
    
              let discountvalueinrupees = parseInt(finalInRupees,10)

              let finalfare = amount - finalInRupees
    
              return res.json({
                success: true,
                finalfare,
                message: 'Congratulation.You got a Discount of ' + finalInRupees,
                discountvalueinrupees,
                couponid
              })
            }


          }


        
          
      }    

    })
    .catch(error => {
      console.log(error);
    })

  } catch (error) {
    return next(error)
  }
}

exports.usecoupon = async(req, res, next) => {
  try {
    
    const userid = req.user.userid;
    const { discountvalueinrupees, couponid } = req.body;

    CouponUsage.sync().then(() => {
      return CouponUsage.create({
        discountvalueinrupees,
        userid,
        couponid
      })
    })
    .then(async(createdCouponUsage) => {
      let id = createdCouponUsage.couponusageid

      let newusage = await CouponUsage.findById(id,{
        attributes: ['couponusageid','discountvalueinrupees'],
        include: [{model: Coupon,model: User}]
      })

      return res.json({
        success: true,
        newusage
      })

    })


  } catch (error) {
    return next(error)
  }
}

exports.sources = async (req, res, next) => {
  const oauth = {
    consumer_key: 'mQxMddhQknIoLctWGcbqfpfwzNmsoS',
    consumer_secret: 'xWSPPj6jNuVJcd6NoruGzwFRznMZud',
  };

  const url = 'http://api.seatseller.travel/sources';

  request.get({ url, oauth }, (err, response, body) => {
    if (err) {
      console.log(`err ${err}`);
    } else if (response) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        response,
      });
    } else {
      console.log(`body ${body}`);
    }
  });
  
};


exports.trips = async (req, res, next) => {
  const oauth = {
    consumer_key: 'mQxMddhQknIoLctWGcbqfpfwzNmsoS',
    consumer_secret: 'xWSPPj6jNuVJcd6NoruGzwFRznMZud',
  };

  const { from, to, doj } = req.body;

  const url = `http://api.seatseller.travel/availabletrips?source=${from}&destination=${to}&doj=${doj}`;

  request.get({ url, oauth }, (err, response, body) => {
    if (err) {
      console.log(`err ${err}`);
    } else if (response) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        response,
      });
    } else {
      console.log(`body ${body}`);
    }
  });
};

exports.tripdetails = async (req, res, next) => {
  const oauth = {
    consumer_key: 'mQxMddhQknIoLctWGcbqfpfwzNmsoS',
    consumer_secret: 'xWSPPj6jNuVJcd6NoruGzwFRznMZud',
  };

  const { tripid } = req.body;

  const url = `http://api.seatseller.travel/tripdetails?id=${tripid}`;

  request.get({ url, oauth }, (err, response, body) => {
    if (err) {
      console.log(`err ${err}`);
    } else if (response) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        response,
      });
    } else {
      console.log(`body ${body}`);
      // return alert('No network')
    }
  });
};

