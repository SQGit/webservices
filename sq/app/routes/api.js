let express = require('express');
let app = express();
let mongoose = require('mongoose');
let jwt = require('jsonwebtoken');
let moment = require('moment');


let Api = require('../models/api');






module.exports = function(app){






let api = express.Router();




api.post('/login',function(req,res){

    let email = req.body.email;
    let password = req.body.password;


    Api.findOne({"email":email},(err,user) => {
        if(err){
            res.json({
                    code:400,
                    failed:"error ocurred"
            })
        }else if(!user){
            res.json({
                code:204,
                success:"You have logged in from wrong user role"
            })
        }else if(user){
            if(user.password != password){
                res.json({
                    code:204,
                    success:"Email and password does not match"
                })
            }else{
                let token = jwt.sign(user,app.get('superSecret'),{
                    expiresIn: "365 days"
                });



                res.json({
                    code:200,
                    success:"login sucessfull"
                })


            }
        }
        

    })

})


api.use(function(req,res,next){

    let token = req.body.token || req.query.token || req.headers['token'];

    if(token){
        jwt.verify(token,app.get('superSecret'),function(err,decoded){
            if(err){
                return res.json({status: false,message: "Failed to authenticate token"})
            }else{
                req.decoded = decoded;
                next();
            }
        });
    }else{
        return res.status(403).send({
            status: false,
            message: "No token provided"
        })
    }

})














app.use('/sq/api',api)



}