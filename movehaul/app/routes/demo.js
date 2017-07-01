var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var moment = require('moment');


var pool = require('../connection');

module.exports = function(app){


    app.post('/trackdrivers',function(req,res){


        pool.getConnection(function(err,connection){
            if(err){
                res.json({
                    status: false,
                    message: "Error Occured " + err
                })
            }

        connection.query('SELECT track_id,driver_name,driver_mobile,driver_email,driver_latitude,driver_longitude FROM track',function(err,track){
            if(err) throw err
            if(track == 0){
                res.json({
                    status: true,
                    message: "No drivers has been registered yet"
                })
            }else{
                res.json({
                    status: true,
                    message: track
                })
            }
        })




            connection.release();
        })


    })



    app.post('/tracksignup',function(req,res){

        var created = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss')


        var tracksignup = { driver_name: req.body.driver_name,driver_mobile: req.body.driver_mobile,driver_email: req.body.driver_email,driver_password: req.body.driver_password }

        pool.getConnection(function(err,connection){
            if(err){
                res.json({
                    status: false,
                    code: 100,
                    message: "Error in connecting Database"
                })
            }

        
        connection.query('INSERT INTO track SET?',tracksignup,function(err,done){
            if(err){
                res.json({
                    status: false,
                    message: "Error Occured " + err
                })
            }else{
                res.json({
                    status: true,
                    message: "You have been successfully registered."
                })
            }
        })


        connection.release();
        })

    })


//


var trackroutes = express.Router();



trackroutes.post('/tracklogin',function(req,res){

    var mobile = req.body.driver_mobile;
    var password = req.body.driver_password;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }

    connection.query('SELECT * FROM track WHERE driver_mobile = ?',[mobile],function(err,user){
        if(err) throw err;

        if(user == 0){
            res.json({
                status: false,
                message: "Authentication failed.User not found"
            });
        }else if(user != 0){
            if(user[0].driver_password != password){
                res.json({
                    status: false,
                    message: "Authentication failed.Wrong Password"
                });
            }else{
                var token = jwt.sign(user[0].driver_mobile,app.get('superSecret'));

                var track_id = user[0].track_id;
                var driver_name = user[0].driver_name;
                var driver_mobile = user[0].driver_mobile;
                var driver_email = user[0].driver_email;

                res.json({
                    status: true,
                    message: "Logged in successfully",
                    id: track_id,
                    driver_name: driver_name,
                    driver_mobile: driver_mobile,
                    driver_email: driver_email,
                    token: token
                })


            }
        }
    })



        connection.release();
    })

})



trackroutes.use(function(req,res,next){

    var token = req.body.token || req.query.token || req.headers['sessiontoken'];

    if(token){
        jwt.verify(token,app.get('superSecret'),function(err,decoded){
            if(err){
                return res.json({
                    status: false,
                    message: "Failed to authenticate token"
                })
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


// Location update


trackroutes.post('/location',function(req,res){

    var id = req.headers['id'];

    var latitude = req.body.latitude;
    var longitude = req.body.longitude;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }

        connection.query('UPDATE track SET driver_latitude = ?,driver_longitude = ? WHERE track_id = ?',[latitude,longitude,id],function(err,save){
                    if(err){
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        })
                    }else{
                        res.json({
                            status: true,
                            message: "Location updated successfully"
                        })
                    }
        })

    

        connection.release();
    })

})






app.use('/trackroutes',trackroutes)


}
