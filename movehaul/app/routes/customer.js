var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var moment = require('moment');
var nodemailer = require('nodemailer');

var validator = require('email-validator');
var verifier = require('email-verify')

var pool = require('../connection');


//Twilio configuration

var twilio = require('twilio');

var accountSid = 'AC78e3aefc278a8184d567d7041b97bb20' ;
var authToken = 'aa199ed7aa3914d3fe9e3583ad8a6f20' ;

var client = twilio(accountSid,authToken);


//Nodemailer configuration

var smtpTransport = nodemailer.createTransport('smtps://movehaul.developer%40gmail.com:Noble_123@smtp.gmail.com');

module.exports = function(app){

// Customer Signup

app.post('/customersignup',function(req,res){
    var created = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss')
    var customersignup = {customer_name:req.body.customer_name,customer_mobile:req.body.customer_mobile,customer_email:req.body.customer_email,created_date:created};

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code : 100,
                status : "Error in connecting Database"
            });
        }

     connection.query('INSERT INTO customer SET?',customersignup,function(err,user){
        
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
                        res.json({
                            status : true,
                            info : {
                             id : user.insertId,
                             customer_name : req.body.customer_name,
                             customer_mobile : req.body.customer_mobile,
                             customer_email : req.body.customer_email
                            },
                             message  : "You have been successfully Registered with MoveHaul"
                 });
                    }
    });
    connection.release();
    });
});

/*

app.post('/signup',function(req,res){
    User.findOne({first_name:req.body.first_name,last_name:req.body.last_name,email:req.body.email,phone_number:req.body.phone_number},function(err,user){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            if(user){
                res.json({
                    status :false,
                    message : "User already exists!"
                });
            }else{
                var userModel = new User();
                userModel.first_name = req.body.first_name;
                userModel.last_name = req.body.last_name;
                userModel.email = req.body.email;
                userModel.password = req.body.password;
                userModel.phone_number = req.body.phone_number;
                userModel.save(function(err,user){
                    var token = jwt.sign(user,app.get('superSecret'),{
                    expiresIn : "24h"
                    });
                    user.save(function(err,user1){
                        res.json({
                            status : true,
                            message : "You are successfully Registered",
                            sessionToken : user1.token
                        });
                    });

                });
            }
        }
});
});

*/

//Twilio trial

app.post('/twilio',function(req,res){
    var phonenumber = req.body.phonenumber;
    var a = 235788 ;

    client.messages.create({
        body : "Hello from Hari.Your OTP is " + a,
        to : phonenumber,
        from : '+12014740491' 
    },function(err,message){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : message.sid
            });
        }
    });
});


//Email trial

app.post('/emailvalidate',function(req,res){
    var email = req.body.email;

    verifier.verify(email,function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Invalid Email"
            });
        }else{
                res.json({
                    status : true,
                    message : "valid email"
                });
            }
        
    });
});

//Customer Mobile OTP

app.post('/customermobileotp',function(req,res){
    var customermobile = req.body.customer_mobile ;
    var otp = Math.floor(Math.random()*9000)+1000;

      pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code : 100,
                status : "Error in connecting Database"
            });
        }

        connection.query('SELECT * FROM customer WHERE customer_mobile = ?',[customermobile],function(err,mobile){
        if(err) throw err ;

        if(mobile == 0){
                res.json({
                status : false,
                message : "Register with Movehaul first to Generate OTP"
            });      
        }else{
            client.messages.create({
                body : "Your MoveHaul OTP is" + " " + otp,
                to : customermobile,
                from : '+12014740491'
            },function(err,message){
                if(err){
                    res.json({
                        status : false,
                        message : "Error Occured" + err
                    });
                }else{
                    connection.query('UPDATE customer SET customer_otp = ? WHERE customer_mobile = ?',[otp,customermobile],function(err,save){
                        if(err){
                            res.json({
                                status : false,
                                message : "Error Occured" + err
                            });
                        }else{
                                res.json({
                                    status : true,
                                    message : message.sid
                    });
                        }
                    });
                }
            });  
        }
    });
    connection.release();
    });
});

//Customer Email OTP

app.post('/customeremailotp',function(req,res){
    var customeremail = req.body.customer_email;
    var otp = Math.floor(Math.random()*9000)+1000;

     pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code : 100,
                status : "Error in connecting Database"
            });
        }

 connection.query('SELECT * FROM customer WHERE customer_email = ?',[customeremail],function(err,email){
        if(err) throw err;

        if(email == 0){
            res.json({
                status : false,
                message : "Register with Movehaul first to Generate OTP"
            });
        }else{
                var username = email[0].customer_name ;
                var mailOptions = smtpTransport.templateSender({
                    subject : "OTP for MoveHaul APP",
                    html : "<b>Hello <strong>{{username}}</strong>,your One Time Password for MoveHaul App is <span style=color:blue>{{password}}</span></b>"
                },{
                    from : 'movehaul.developer@gmail.com'
                });

                mailOptions({
                    to : req.body.customer_email
                },{
                    username : username,
                    password : otp
                },function(err,info){
                        if(err){
                            res.json({
                                status : false,
                                message : "Error Occured" + err
                            });
                        }else{
                            connection.query('UPDATE customer SET customer_otp = ? WHERE customer_email = ?',[otp,customeremail],function(err,save){
                                if(err){
                                    res.json({
                                        status : false,
                                        message : "Error Occured" + err
                                    });
                                }else{
                                    res.json({
                                        status : true,
                                        message : "OTP has been sent to your Email"
                                    });
                                }
                            });
                        }
                });

            }
        });
        connection.release();
    });
});



var apiRoutes = express.Router();

//Customer Mobile login

apiRoutes.post('/mobilelogin',function(req,res){
        var customermobile = req.body.customer_mobile;
        var customer_otp = req.body.customer_otp;

        pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code : 100,
                status : "Error in connecting Database"
            });
        }

         connection.query('SELECT * FROM customer WHERE customer_mobile = ?',[customermobile],function(err,mobile){
            if(err) throw err;

            if(mobile == 0){
                res.json({
                    status : false,
                    message : "Authentication failed.User not found"
                });
            }else if(mobile != 0){
                if(mobile[0].customer_otp != req.body.customer_otp){
                    res.json({
                        status : false,
                        message : "Authentication failed.Wrong Password"
                    });
                }else{
                    var token = jwt.sign(mobile[0].customer_mobile,app.get('superSecret'));

                    var id = mobile[0].customer_id ;
                    var customer_mobile = mobile[0].customer_mobile;
                    var customer_email = mobile[0].customer_email;

                    res.json({
                        status : true,
                        message : "Logged in successfully",
                        id : id,
                        customer_mobile : customer_mobile,
                        customer_email : customer_email,
                        token : token
                    });
                }
            }
        });
        connection.release();
});
});

//Customer Email Login 

apiRoutes.post('/emaillogin',function(req,res){
        var customeremail = req.body.customer_email;
        var customer_otp = req.body.customer_otp;

        pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code : 100,
                status : "Error in connecting Database"
            });
        }

        connection.query('SELECT * FROM customer WHERE customer_email = ?',[customeremail],function(err,email){
            if(err) throw err;

            if(email == 0){
                res.json({
                    status : false,
                    message : "Authentication failed.User not found"
                });
            }else if(email != 0){
                if(email[0].customer_otp != req.body.customer_otp){
                    res.json({
                        status : false,
                        message : "Authentication failed.Wrong Password"
                    });
                }else{
                    var token = jwt.sign(email[0].customer_mobile,app.get('superSecret'));

                    var id = email[0].customer_id ;
                    var customer_mobile = email[0].customer_mobile;
                    var customer_email = email[0].customer_email;

                    res.json({
                        status : true,
                        message : "Logged in successfully",
                        id : id,
                        customer_mobile : customer_mobile,
                        customer_email : customer_email,
                        token : token
                    });
                }
            }
        });
        connection.release();
    }); 
});



/*

apiRoutes.post('/login',function(req,res){

    User.findOne({
        email : req.body.email
    },function(err,user){
        if(err) throw err;

        if(!user){
            res.json({
                status : false,
                message : "Authentication failed.User not found"
            });
        }else if(user){
            if(user.password != req.body.password){
                res.json({
                    status : false,
                    message : "Authentication failed. Wrong password"
                });
            }else{
                var token = jwt.sign(user,app.get('superSecret'),{
                    expiresIn : "24h"
                });
                
                var id = user._id;

                res.json({
                    status : true,
                    message : "Logged in successfully!",
                    id : id,
                    sessionToken : token
                });
            }
        }
    });
});

*/



apiRoutes.use(function(req,res,next){
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



app.use('/customer',apiRoutes);

};