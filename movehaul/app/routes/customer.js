var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var moment = require('moment');
var multer = require('multer');
var mime = require('mime');
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


//Booking Goods Image

var bookinggoodsstorage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/bookinggoods');
    },
    filename : function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});

var bookinggoodsupload = multer({
    storage : bookinggoodsstorage
}).array('bookinggoods',5);


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

//Trial Customer Mobile OTP

app.post('/customermobileotp',function(req,res){
    var customermobile = req.body.customer_mobile ;
    var otp = Math.floor(Math.random()*9000)+1000;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code :100,
                status : "Error in connecting Database"
            });
        }

        connection.query('SELECT * FROM customer WHERE customer_mobile = ?',[customermobile],function(err,mobile){
        if(err) throw err ;

        if(mobile == 0){
            res.json({
                status : false,
                message : "Register with MoveHaul first to Generate OTP"
            });
        }else{

                
        var customeremail = mobile[0].customer_email ;

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
                    to : customeremail
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
                }
                      else{
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
                        }
                });

            }
        });


        }


        });


        connection.release();
    })
})




//Customer Mobile OTP

app.post('/customermobileotp---',function(req,res){
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

                            
                        var customeremail = mobile.customer_email;

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
                    var customer_name = mobile[0].customer_name;

                    res.json({
                        status : true,
                        message : "Logged in successfully",
                        id : id,
                        customer_mobile : customer_mobile,
                        customer_email : customer_email,
                        customer_name : customer_name,
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
                    var customer_name = email[0].customer_name;

                    res.json({
                        status : true,
                        message : "Logged in successfully",
                        id : id,
                        customer_mobile : customer_mobile,
                        customer_email : customer_email,
                        customer_name : customer_name,
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

//Customer Retrieving Emergency contacts

apiRoutes.post('/getemergency',function(req,res){
    
    var customerid = req.headers['id'];

    pool.getConnection(function(err,connection){
        if(err){
            throw err;
        }

    connection.query('SELECT * FROM customer_emergency WHERE customer_id = ?',[customerid],function(err,emergency){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : emergency
            });
        }
    });


    connection.release();
    });
});


// Customer Adding Emergency Contacts

apiRoutes.post('/insertemergency',function(req,res){
    
    var customerid = req.headers['id'];

    var customerEmergency = { emergency_name : req.body.emergency_name, emergency_mobile : req.body.emergency_mobile, emergency_relation : req.body.emergency_relation};

    pool.getConnection(function(err,connection){
        if(err){
            throw err;
        }

    connection.query('SELECT * FROM customer_emergency WHERE customer_id = ?',[customerid],function(err,emergency){
        if(err) throw err ;
         
        
        if(emergency == 0){
            connection.query('INSERT INTO customer_emergency SET emergency_name = ?, emergency_mobile = ?,emergency_relation = ?, customer_id = ?' ,[customerEmergency.emergency_name,customerEmergency.emergency_mobile,customerEmergency.emergency_relation,customerid],function(err,save){
                if(err){
                    res.json({
                        status : false,
                        message : "Error Occured" + err
                    });
                }else{
                    res.json({
                        status : true,
                        message : "Emergency contact added successfully"
                    });
                }
            });
        }else if(emergency == 1){
            connection.query('INSERT INTO customer_emergency SET emergency_name = ?, emergency_mobile = ?,emergency_relation = ?, customer_id = ?',[customerEmergency.emergency_name,customerEmergency.emergency_mobile,customerEmergency.emergency_relation,customerid],function(err,save){
                if(err){
                    res.json({
                        status : false,
                        message : "Error Occured" + err
                    });
                }else{
                    res.json({
                        status : true,
                        message : "Emergency contact added successfully"
                    });
                }
            });
        }else{
            res.json({
                    status : false,
                    message : "Not more than 2 contacts can be added for Emergency"
            });
        }

    });
        connection.release();
    })

});

//Customer Updating Emergency contacts

apiRoutes.post('/updateemergency',function(req,res){
    
    var customerid = req.headers['id'];

    var customerEmergency = { emergency_id : req.body.emergency_id,emergency_name : req.body.emergency_name,emergency_mobile : req.body.emergency_mobile,emergency_relation : req.body.emergency_relation};

    pool.getConnection(function(err,connection){
        if(err){
            throw err;
        }

    connection.query('UPDATE customer_emergency SET emergency_name = ?,emergency_mobile = ?, emergency_relation = ? WHERE emergency_id = ?',[customerEmergency.emergency_name,customerEmergency.emergency_mobile,customerEmergency.emergency_relation,customerid],function(err,update){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : "Emergency contact has been updated successfully"
            })
        }
    })

    connection.release();
    });
});

// Customer finding Driver Location

apiRoutes.post('/finddrivers',function(req,res){
   
    var customerid = req.headers['id'];

    var customerlocation = { customer_latitude : req.body.customer_latitude,customer_longitude : req.body.customer_longitude,customer_locality : req.body.customer_locality };

    pool.getConnection(function(err,connection){
        if(err){
            throw err;
        }

    connection.query('SELECT * FROM driver WHERE driver_status = ?',["active"],function(err,active){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
             });
        }else{

            connection.query('SELECT * FROM driver_location WHERE driver_locality1 = ? ',[customerlocation.customer_locality],function(err,locality){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : locality
            });
        }
    });

        }
    })
   

        connection.release();
    })
     
})


// Customer getting Goods Type

apiRoutes.post('/goodstype',function(req,res){

    var customer_id = req.headers['id'];

    pool.getConnection(function(err,connection){
    if(err) throw err ;

    connection.query('SELECT * FROM goods_type',function(err,goods){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
                var goodsType = [];

                for(var i=0;i<goods.length;i++){ 
                        goodsType.push(goods[i].goods_type);
                    }

            res.json({
                status : true,
                goods_type : goodsType
            });
        }
    });
        connection.release();
    });
});


// Customer getting Truck Types

apiRoutes.post('/trucktype',function(req,res){

    var customer_id = req.headers['id'];

    pool.getConnection(function(err,connection){
    if(err) throw err ;

    connection.query('SELECT * FROM truck_type',function(err,truck){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
              
            res.json({
                status : true,
                truck_type : truck
            });
        }
    });
        connection.release();
    });
});

// Customer Booking for Job

apiRoutes.post('/booking',function(req,res){

    var customer_id = req.headers['id'];
    var pickup_location = req.headers['pickup_location'] || req.body.pickup_location ;
    var drop_location = req.headers['drop_location'] || req.body.drop_location ;
    var goods_type = req.headers['goods_type'] || req.body.goods_type ;
    var truck_type = req.headers['truck_type'] || req.body.truck_type ;
    var booking_time = req.headers['booking_time'] || req.body.booking_time ;
    var goods_image1 = req.body.goods_image1 ;
    var goods_image2 = req.body.goods_image2 ;
 

    pool.getConnection(function(err,connection){
        if(err) throw err ;


    bookinggoodsupload(req,res,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            connection.query('INSERT INTO bookings SET customer_id = ?,pickup_location = ?,drop_location = ?, goods_type = ?, truck_type = ?,description = ?,goods_image1 = ?,goods_image2 = ?',[customer_id,pickup_location,drop_location,goods_type,truck_type,goods_image1,goods_image2],function(err,save){
                if(err){
                    res.json({
                        status :false,
                        message : "Error Occured" + err
                    })
                }else{
                    res.json({
                        status : true,
                        message : "Your Post has been added successfully"
                    });
                }
        });

        }
    })

            connection.release();
    })
})








app.use('/customer',apiRoutes);

};





 