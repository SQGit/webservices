var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var moment = require('moment');
var multer = require('multer');
var mime = require('mime');
var nodemailer = require('nodemailer');
var easyid = require('easyid');


var pool = require('../connection');



module.exports = function(app){



// Create Admin

app.post('/createadmin',function(req,res){

    let username = req.body.username;
    let password = req.body.password;


    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code: 100,
                status: false,
                message: "Error in connecting Database"
            })
        }


        connection.query('INSERT INTO admin SET username = ?,password = ?'[username,password],function(err,save){
            if(err){
                res.json({
                    status: false,
                    message: "Error Occured " + err
                })
            }else{
                res.json({
                    status: true,
                    message: "Admin successfully registered"
                })
            }
        })


            connection.release();
        
    })

})


var adminRoutes = express.Router();


// Admin Login


adminRoutes.post('/login',function(req,res){

    var username = req.body.username;
    var password = req.body.password;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code: 100,
                status: false,
                message: "Error in connecting Database"
            });
        }

    
    connection.query('SELECT * FROM admin WHERE username = ?',[username],function(err,admin){
        if(err) throw err;

        if(admin == 0){
            res.json({
                status: false,
                message: "Authentication failed.User not found"
            })
        }else if(admin != 0){
            if(admin[0].password != password){
                res.json({
                    status: false,
                    message: "Authentication failed.Wrong Password"
                })
            }else{

                var token = jwt.sign(admin[0].username,app.get('superSecret'));

                var id = admin[0].id;

                res.json({
                    status: true,
                    message: "Logged in successfully",
                    id: id,
                    token: token
                })

            }
        }
    })


    
        connection.release();
    })

})



adminRoutes.use(function(req,res,next){
    var token = req.body.token || req.query.token || req.headers['sessiontoken'];

    if(token){
        jwt.verify(token,app.get('superSecret'),function(err,decoded){
            if(err){
                return res.json({
                    status: false,
                    message: 'Failed to authenticate token'
                });
            }else{
                req.decoded = decoded;
                next();
            }
        });
    }else{
        return res.status(403).send({
            status : false,
            message: 'No token provided'
        });
    }
});








app.use('/admin',adminRoutes);



}