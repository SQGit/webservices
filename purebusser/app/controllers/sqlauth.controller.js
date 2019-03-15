const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const User = require('../sqlmodels/user.model');
const Wallet = require('../sqlmodels/wallet.model');

const { jwtSecret } = require('../config/vars');
const request = require('request');

const moment = require('moment');

function generateTokenResponse(user) {
  const accessToken = jwt.sign(user, jwtSecret, {
    expiresIn: '365 days',
  });
  return accessToken;
}

exports.otp = async(req, res, next) => {
    try {
        const otp = Math.floor(Math.random() * 9000) + 1000;
        const { tonumber } = req.body;

        const phone = await User.findOne({where: { phone: tonumber}})


        if(!phone){
            return res.json({
              success: false,
              code: httpStatus.NOT_ACCEPTABLE,
              message: 'Register with Purebus first to get an Otp'
            })
        }

        await User.update({otp},{
            where: {phone: tonumber}
        })

        const message = `${otp} is otp for Purebus Login`

        const url = `http://indiabulksms.org/httpapi/v1/sendsms?api-token=o0173u.pw2*jsxezyn5q9)ac(mlh4tk_rbdf68vi&numbers=${tonumber}&route=2&message=${message}&sender=PURBUS`;

        await request.get(url);

        return res.json({
            success: true,
            code: httpStatus.OK,
            message: 'Otp has been sent to your phone',
        });

    }catch(error){
        return next(error);
    }
    
}

exports.otpsignin = async(req, res, next) => {
    try {
        const { tonumber, otp} = req.body;

        const phone = await User.findOne({where: { phone: tonumber, otp}})

        if(!phone){
            return res.json({
              success: false,
              code: httpStatus.NOT_ACCEPTABLE,
              message: 'Incorrect Otp. Try again'
            })
        }

        const checkuser = await User.find({
            where: {"phone": tonumber},
            attributes: [
                'userid',
                'email',
                'phone',
                'name',
                'usertype',
                'password'
            ],
            include: [{model: Wallet}]
        })

        let user = {
            userid: checkuser.userid,
            email: checkuser.email,
            phone: checkuser.phone,
            name: checkuser.name,
            usertype: checkuser.usertype
        }

        let wallet = checkuser.wallet === null ? {} : checkuser.wallet

        const token = generateTokenResponse(user)

        return res.json({
            success: true,
            code: httpStatus.OK,
            user,
            wallet,
            token
        })

    } catch (error) {
        return next(error);
    }
}

exports.signup = async(req, res, next) => {
    try {
        
        const { name ,email ,phone, password} = req.body;

        User.sync().then(() => {
            return User.create({
                name,
                email,
                phone,
                password
            })
        })
        .then(async (createdUser) => {
            let id = createdUser.userid;
            
            let newuser = await User.findById(id,{
                attributes: ['userid','email','phone',
                'name','usertype',],
                include: [{model: Wallet}]
            })

            let user = {
                userid: newuser.userid,
                email: newuser.email,
                phone: newuser.phone,
                name: newuser.name,
                usertype: newuser.usertype
            }

            let wallet = newuser.wallet === null ? {} : newuser.wallet

            const token = generateTokenResponse(user)

            return res.json({
                success: true,
                code: httpStatus.OK,
                user,
                wallet,
                token
            })
        })
        .catch((err) => {
            let message = "";
            if(err.name === "SequelizeDatabaseError"){
                message = err.parent.message
            }else if(err.name = "SequelizeUniqueConstraintError"){
                let path = err.errors[0].path
                if(path === "email_UNIQUE"){
                    message = "Email exists already"
                }else if(path === "phone_UNIQUE"){
                    message = "Phone number exists already"
                }
            }

            return res.json({
                success: false,
                code: httpStatus.NOT_FOUND,
                message: message
            })
        })

    } catch (error) {
        return next(error);
    }
}

exports.signin = async(req, res, next) => {
    try {
        const { email , password} = req.body;

        const checkuser = await User.find({
            where: {"email": email},
            attributes: [
                'userid',
                'email',
                'phone',
                'name',
                'usertype',
                'password'
            ],
            include: [{model: Wallet}]
        })

        if(checkuser === null){
            return res.json({
                success: false,
                code: httpStatus.CONFLICT,
                message: "User not exist"
            })
        }else if(checkuser.password !== password){
            return res.json({
                success: false,
                code: httpStatus.CONFLICT,
                message: 'Password does not match'
            })
        }

        let user = {
            userid: checkuser.userid,
            email: checkuser.email,
            phone: checkuser.phone,
            name: checkuser.name,
            usertype: checkuser.usertype
        }

        let wallet = checkuser.wallet === null ? {} : checkuser.wallet

        const token = generateTokenResponse(user)

        return res.json({
            success: true,
            code: httpStatus.OK,
            user,
            wallet,
            token
        })


    } catch (error) {
        return next(error)
    }
}

// exports.create = async(req,res,next) => {
//     try {

//         const { name, phone, email, password } = req.body;

//         User.sync().then(() => {
//             return User.create({
//                 name,
//                 email,
//                 phone,
//                 password
//             })
//         })
//         .then(async (createduser) => {

//             let id = createduser.userid;

//             let user = await User.findById(id,{
//                 attributes: ['name','email','phone','userid','usertype','createdAt']
//             })
        
//             return res.json({
//                 success: true,
//                 user
//             })

            
//         })
//         .catch((err) => {
//             // let error = err.errors[0].message

//             let error = "";

//             if(err.name === "SequelizeDatabaseError"){
//                 error = err.parent.message
//             }else{
//                 error = err.errors[0].message
//             }

//             return res.json({
//                 success: false,
//                 message: error
//             })
//         })


        
//     } catch (error) {
//         return next(error);
//     }
// }

exports.getuser = async(req,res,next) => {
    try {
        let user = await User.find({
            where: {"name": "Hari"},
            attributes: [
                'name',
                'email',
                'phone'
            ]
        })
        

        return res.json({
            success: true,
            user
        })
    } catch (error) {
        return next(error);
    }
}

exports.getuserbyid = async(req, res, next) => {
    try {
        const { userid } = req.body;
        let user = await User.findById(userid)

        return res.json({
            user
        })

    } catch (error) {
         return next(error);
    }
}
