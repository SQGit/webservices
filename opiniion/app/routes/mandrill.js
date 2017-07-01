let express = require('express');
let app = express();
let mongoose = require('mongoose');
let moment = require('moment');

let path = require('path');
let fs = require('fs');




//Models

let User = require('../models/user');
let Shop = require('../models/shop');




// Mandrill API


let mandrillkey = 'ryB4fivQNMoYMkosR9E0IA' ;

let mandrill = require('mandrill-api/mandrill');

let mandrillClient = new mandrill.Mandrill(mandrillkey)







module.exports = function(app){





let mandrill = express.Router();




// Get Webhooks List

mandrill.post('/getwebhooks',function(req,res){

    mandrillClient.webhooks.list({},function(result,err){
        if(result){
            res.json({
                status: true,
                message: result
            })
        }else{
            res.json({
                status: false,
                message: err
            })
        }
       
    })


})







// Add Webhook

mandrill.post('/addwebhook',function(req,res){

    let url = "http://104.197.80.225:3010/opiniion/testmessage"
    let description = "Test Webhook";

    let events = [
        "send",
        "open",
        "click"
    ]

    mandrillClient.webhooks.add({"url": url,"description": description,"events":events},function(result,err){
        if(result){
            res.json({
                status: true,
                message: result
            })
        }else{
            res.json({
                status: false,
                message: err
            })
        }
    })


})


// Info about a particular webhook


mandrill.post('/webhookinfo',function(req,res){

    let id = req.body.id;

    mandrillClient.webhooks.info({"id":id},function(result,err){
        if(result){
            res.json({
                status: true,
                message: result
            })
        }else{
            res.json({
                status: false,
                message: err
            })
        }
    })

})


//Updating an Existing Webhook


mandrill.post('/updatewebhook',function(req,res){

    let id = req.body.id;

    let url = req.body.url;
    let description = req.body.description;

    let events = [
        "send",
        "open",
        "click"
    ]

    mandrillClient.webhooks.update({"id":id,"url":url,"description":description,"events":events},function(result,err){
        if(result){
            res.json({
                status: true,
                message: result
            })
        }else{
            res.json({
                status: false,
                message: err
            })
        }
    })


})


//Deleting an existing Webhook

mandrill.post('/deletewebhook',function(req,res){

    let id = req.body.id;

    mandrillClient.webhooks.delete({"id":id},function(result,err){
        if(result){
            res.json({
                status: true,
                message: result
            })
        }else{
            res.json({
                status: false,
                message: err
            })
        }
    })

})


//Messages

// Get a particular message info

mandrill.post('/getmessageinfo',function(req,res){

    let id = req.body.id ;

    mandrillClient.messages.info({"id":id},(result,err) => {
        if(result){
            res.json({
                status: true,
                message: result
            })
        }else{
            res.json({
                status: false,
                message: err
            })
        }
    })

})













app.use('/opiniion/mandrill',mandrill);













}

