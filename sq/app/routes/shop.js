let express = require('express');
let app = express();
let mongoose = require('mongoose');
let jwt = require('jsonwebtoken');
let moment = require('moment');


let Shop = require('../models/shop');
let Service = require('../models/service');





module.exports = function(app){






let shop = express.Router();




shop.post('/login',function(req,res){

    let shopname = req.body.shopname;
    let password = req.body.password;


    Shop.findOne({"shopname":shopname},(err,user) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else if(!user){
            res.json({
                status: false,
                message: "Authentication failed. User not found"
            })
        }else if(user){
            if(user.password != password){
                res.json({
                    status: false,
                    message: "Authentication failed.Wrong password"
                })
            }else{
                let token = jwt.sign(user,app.get('superSecret'),{
                    expiresIn: "365 days"
                });

                let id = user._id;
                let shop = user.shopname;

                let viewservice = "" ;

                if(shopname == "SQIndia Hardware"){
                    viewservice += "true"
                }else{
                    viewservice += "false"
                }



                res.json({
                    status:true,
                    id: id,
                    token: token,
                    shopname: shopname,
                    viewservice: viewservice
                })


            }
        }
        

    })

})


shop.use(function(req,res,next){

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


shop.post('/soldcustomer',function(req,res){

    let id = req.headers['id'];

    let username = req.body.username;
    let email = req.body.email;
    let phone = req.body.phone;
    let dateofbirth = req.body.dateofbirth;
    let rating = req.body.rating;

    //let posted = moment().add(5.5,'hours').format('YYYY/MM/DD h:mm:ss');

    let posted = req.body.posted;

    Shop.findByIdAndUpdate(id,{$push:{"sold":{$each:[{username: username,email: email,phone: phone,dateofbirth: dateofbirth,rating: rating,posted: posted}],$position: 0}}},(err,save) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: "Your Ratings has been posted successfully"
            })
        }
    })


})


shop.post('/enquirycustomer',function(req,res){

    let id = req.headers['id'];

    let username = req.body.username;
    let email = req.body.email;
    let phone = req.body.phone;
    let dateofbirth = req.body.dateofbirth;
    let comments = req.body.comments;

    let posted = req.body.posted;

    // let posted = moment.add(5.5,'hours').format('YYYY/MM/DD h:mm:ss');

    Shop.findByIdAndUpdate(id,{$push: {"enquiry":{$each: [{username:username,email: email,phone: phone,dateofbirth: dateofbirth,comments: comments,posted: posted}],$position: 0}}},(err,save) =>{
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: "Your comments has been posted successfully"
            })
        }
    })



})




shop.post('/createservice',function(req,res){

    let id = req.headers['id'];
    
    let username = req.body.username;
    let email = req.body.email;
    let phone = req.body.phone;
    let device = req.body.device;
    let imei = req.body.imei;
    let serial = req.body.serial;
    let model = req.body.model;
    let description = req.body.description;
    let staffname = req.body.staffname;

    let created = moment().add(5.5,'hours').format('YYYY/MM/DD h:mm:ss a');

    let newService = new Service();

    newService.username = username;
    newService.email = email;
    newService.phone = phone;
    newService.device = device;
    newService.imei = imei;
    newService.serial = serial;
    newService.model = model;
    newService.created = created;
    newService.description = description;

    newService.save(function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            console.log(info)
            res.json({
                status: true,
                serviceid: info.serviceid,
                message: "Service has been registered successfully"
            })
        }
    })


})



//Update Service



shop.post('/updateservice',function(req,res){


    let id = req.headers['id'];

    let serviceid = req.body.serviceid;

    let status = req.body.status


    Service.findOne({"serviceid":serviceid},{status:1},(err,service) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else if(!service){
            res.json({
                status: true,
                message: "Please check the Service ID"
            })
        }else{

            if(status == service.status){
                res.json({
                    status: true,
                    message: "Your status has been updated already"
                })
            }else{
                Service.findOneAndUpdate({"serviceid":serviceid},{$set:{"status":status}},{safe:true,upsert:true,new:true},(err,done) => {
                    if(err){
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        })
                    }else{
                        res.json({
                            status: true,
                            message: "Status has been updated"
                        })
                    }
                })

            }
            
        }
    })




})



// Service List

shop.post('/servicelist',function(req,res){

    let id = req.headers['id'];


    Service.find({}).sort({_id:-1}).exec((err,service) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: service
            })
        }
    })

})



// View By Service ID


shop.post('/viewbyserviceid',function(req,res){

    let id = req.headers['id'];

    let serviceid = req.body.serviceid;

    Service.findOne({"serviceid":serviceid},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occuered " + err
            })
        }else{
            res.json({
                status: true,
                message: [info]
            })
        }
    })


})




// View By phone


shop.post('/viewbyphone',function(req,res){

    let id = req.headers['id'];

    let phone = req.body.phone;

    Service.find({"phone":phone},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occuered " + err
            })
        }else{
            res.json({
                status: true,
                message: info
            })
        }
    })


})



// View by Date

shop.post('/viewbydate',function(req,res){

    let id = req.headers['id'];

    let start = req.body.startdate ;
    let end = req.body.enddate ;


    Service.find({"created": {$gte: start,$lt: end}},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: info
            })
        }
    })

})




app.use('/sq/shop',shop)



}