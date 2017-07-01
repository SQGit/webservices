var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var moment = require('moment');
var multer = require('multer');
var mime = require('mime');
var nodemailer = require('nodemailer');
var easyid = require('easyid');


var validator = require('email-validator');
var verifier = require('email-verify')



var request = require('request');

//fcm targets driver

var serverkey  = 'AAAAzGfmywU:APA91bEsExIN0HQyaLR-ASpD5n2Tzg3bAT-8Us_2tNITIU1XOYXX_z1fY4a5misiQXE-Vh14fIa5NUQ7pNE5yMdHnjA9hoKMayPkBFRUuCF-lCYPRNA7Hqy2z7jITF7bc1Ai-K5eDVxU1zSMhNrjvtgixEjiFgLzpg'



var pool = require('../connection');


//Twilio configuration

var twilio = require('twilio');

var accountSid = 'AC78e3aefc278a8184d567d7041b97bb20' ;
var authToken = 'aa199ed7aa3914d3fe9e3583ad8a6f20' ;

var client = twilio(accountSid,authToken);


//Nodemailer configuration

var smtpTransport = nodemailer.createTransport('smtps://movehaul.developer%40gmail.com:Noble_1234@smtp.gmail.com');


//Booking Goods Image

var bookinggoodsstorage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'C:/wamp64/www/movehaul/assets/img/booking_goods');
    },
    filename : function(req,file,cb){
        var datetimestamp = Date.now();
        var userid = req.headers['id'];
        cb(null,userid + '-' + file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});

var bookinggoodsupload = multer({
    storage : bookinggoodsstorage
}).array('bookinggoods',5);


//Customer Profile

var customerupdatestorage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'C:/wamp64/www/movehaul/assets/img/customer_details');
    },
    filename : function(req,file,cb){
        var datetimestamp = Date.now();
        var userid = req.headers['id'];
        cb(null,userid + '-' + file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
})

var customerupdateupload = multer({
    storage : customerupdatestorage
}).array('customerimage',1)



module.exports = function(app){
































//emergencypayment service have to include the no drivers message










//Retrieving the Vehicle Details

app.get('/vehicle_types/:name',function(req,res,next){
    var options = {
       // root : __dirname + /../ + /../ + 'public/driverupdate'
          root : 'C:/wamp64/www/movehaul/assets/img/vehicle_types'
    };

    var filename = req.params.name;
    res.sendFile(filename,options,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
           console.log(filename +" has been sent")
        }
    });
    
});


// Retrieving the Customer Images

app.get('/customer_details/:name',function(req,res,next){
   
    var filename = req.params.name;

    var options = {
        root : 'C:/wamp64/www/movehaul/assets/img/customer_details'
    }

    res.sendFile(filename,options,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            console.log(filename +" has been sent")
        }
    });  

});

// Customer Signup

app.post('/customersignup',function(req,res){

    var created = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss')
    
     var num2 = easyid.generate({
        groups : 1,
        length : 2,
        alphabet : '0123456789'
    });

    var char2 = easyid.generate({
        groups : 1,
        length : 2,
        alphabet : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    });

    var num1 = easyid.generate({
        groups : 1,
        length : 1,
        alphabet : '0123456789'
    });

    var fake_id = "MOVC" + num2 + char2 + num1 ;
    
    
    var customersignup = {customer_name:req.body.customer_name,customer_mobile:req.body.customer_mobile,customer_email:req.body.customer_email,created_date:created,fake_id : fake_id,fcm_id: req.body.fcm_id};

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
                             customer_email : req.body.customer_email,
                             fake_id : fake_id
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

        var fcm_id = req.body.fcm_id;

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

                    var customer_id = mobile[0].customer_id ;
                    var fake_id = mobile[0].fake_id ;
                    var customer_mobile = mobile[0].customer_mobile;
                    var customer_email = mobile[0].customer_email;
                    var customer_name = mobile[0].customer_name;
                    var customer_image = mobile[0].customer_image;

                    connection.query('UPDATE customer SET fcm_id = ? WHERE customer_id = ?',[fcm_id,customer_id],function(err,fcm){
                        if(err){
                            res.json({
                                status: false,
                                message: "Error Occured " + err
                            })
                        }else{


                                res.json({
                                    status : true,
                                    message : "Logged in successfully",
                                    customer_id : customer_id,
                                    fake_id : fake_id,
                                    customer_mobile : customer_mobile,
                                    customer_email : customer_email,
                                    customer_name : customer_name,
                                    customer_image : customer_image,
                                    token : token
                                });



                        }

                    })

                  
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

        var fcm_id = req.body.fcm_id;

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

                    var customer_id = email[0].customer_id ;
                    var fake_id = email[0].fake_id ;
                    var customer_mobile = email[0].customer_mobile;
                    var customer_email = email[0].customer_email;
                    var customer_name = email[0].customer_name;
                    var customer_image = email[0].customer_image;

                    connection.query('UPDATE customer SET fcm_id = ? WHERE customer_id = ?',[fcm_id,customer_id],function(err,fcm){
                        if(err){
                            res.json({
                                status: false,
                                message: "Error Occured " + err
                            })
                        }else{

                                res.json({
                                    status : true,
                                    message : "Logged in successfully",
                                    customer_id : customer_id,
                                    fake_id : fake_id,
                                    customer_mobile : customer_mobile,
                                    customer_email : customer_email,
                                    customer_name : customer_name,
                                    customer_image : customer_image,
                                    token : token
                                });

                        }
                    })

                  
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



//Customer Updating profile details

apiRoutes.post('/customerupdate',function(req,res){

    var customer_id = req.headers['id'];

    var customer_name = req.headers['customer_name'] || req.body.customer_name ;
    var customer_email = req.headers['customer_email'] || req.body.customer_email ;


    pool.getConnection(function(err,connection){
        if(err) throw err ;


    customerupdateupload(req,res,function(err){

        if(err){
            res.json({
                status: false,
                message : "Error Occured" + err
            });
        }else{

            connection.query('SELECT * FROM customer WHERE customer_id = ?',[customer_id],function(err,customer){
                if(err){
                    res.json({
                        status : false,
                        message : "Error Occured" + err
                    });
                }else{

                    
                            if(req.files == undefined){
                                function customerImage(){
                                    return customerimage = customer[0].customer_image ;
                                }
                                    var customerimage = customerImage()
                            }else if(req.files.length == 1){
                                function customerImage(){
                                    if(typeof req.files[0].filename !== undefined){
                                        return customerimage = req.files[0].filename
                                    }else{
                                        return customerimage = customer[0].customer_image ;
                                    }
                                    }
                                    var customerimage = customerImage();
                            }

                
            connection.query('UPDATE customer SET customer_name = ?,customer_email = ?,customer_image = ? WHERE customer_id = ?',[customer_name,customer_email,customerimage,customer_id],function(err,save){
                if(err){
                    res.json({
                        status : false,
                        message : "Error Occured" + err
                    })
                }else{
                    res.json({
                        status : true,
                        customer_name : customer_name,
                        customer_email : customer_email,
                        customer_image : customerimage
                    });
                }

            });


                }


            });

        }

    });

        connection.release();
    })

});




//Customer Retrieving Emergency contacts

apiRoutes.post('/getemergency',function(req,res){
    
    var customer_id = req.headers['id'];

    pool.getConnection(function(err,connection){
        if(err){
            throw err;
        }

    connection.query('SELECT * FROM customer_emergency WHERE customer_id = ?',[customer_id],function(err,emergency){
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
    
    var customer_id = req.headers['id'];

    var customerEmergency = { emergency_name : req.body.emergency_name, emergency_mobile : req.body.emergency_mobile, emergency_relation : req.body.emergency_relation};

    pool.getConnection(function(err,connection){
        if(err){
            throw err;
        }

    connection.query('SELECT COUNT(*) AS count FROM customer_emergency WHERE customer_id = ?',[customer_id],function(err,emergency){
        if(err) throw err ;

        if(emergency[0].count >= 2){
            res.json({
                    status : false,
                    message : "Not more than 2 contacts can be added for Emergency"
            });
        }else{
            connection.query('INSERT INTO customer_emergency SET emergency_name = ?, emergency_mobile = ?,emergency_relation = ?, customer_id = ?' ,[customerEmergency.emergency_name,customerEmergency.emergency_mobile,customerEmergency.emergency_relation,customer_id],function(err,save){
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
        }

    });
        connection.release();
    })

});



//Customer Updating Emergency contacts

apiRoutes.post('/updateemergency',function(req,res){
    
    var customer_id = req.headers['id'];


    var emergency_id = req.body.emergency_id;
    var emergency_name = req.body.emergency_name;
    var emergency_mobile = req.body.emergency_mobile;
    var emergency_relation = req.body.emergency_relation;

    pool.getConnection(function(err,connection){
        if(err){
            throw err;
        }

    connection.query('UPDATE customer_emergency SET emergency_name = ?,emergency_mobile = ?, emergency_relation = ? WHERE emergency_id = ?',[emergency_name,emergency_mobile,emergency_relation,emergency_id],function(err,update){
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
   
    var customer_id = req.headers['id'];

    var latitude = req.body.latitude;
    var longitude = req.body.longitude;

    pool.getConnection(function(err,connection){
        if(err){
            throw err;
        }

    connection.query('SELECT driver.driver_id,truck.truck_type,driver_location.driver_latitude,driver_location.driver_longitude, ( 3959 * acos( cos( radians(' + latitude + ') ) * cos( radians( driver_latitude ) ) * cos( radians( driver_longitude ) - radians(' +longitude + ') ) + sin( radians(' + latitude + ') ) * sin( radians( driver_latitude ) ) ) ) AS distance FROM driver INNER JOIN truck ON driver.driver_id = truck.driver_id INNER JOIN driver_location ON driver.driver_id = driver_location.driver_id WHERE driver.driver_status = ? HAVING distance < 10 ',["active"],function(err,active){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
             });
        }else{
            res.json({
                status: true,
                message: active //change
            })
        

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




// // Customer getting Vehicle Types

// apiRoutes.post('/vehicletype',function(req,res){

//     var customer_id = req.headers['id'];

//     pool.getConnection(function(err,connection){
//     if(err) throw err ;

//     connection.query('SELECT * FROM truck_type',function(err,truck){
//         if(err){
//             res.json({
//                 status : false,
//                 message : "Error Occured" + err
//             });
//         }else{
            
//             connection.query('SELECT * FROM bus_mini_van_type',function(err,bus){
//                 if(err){
//                     res.json({
//                         status: false,
//                         message: "Error Occured " + err
//                     })
//                 }else{
//                     res.json({
//                         status: true,
//                         truck_type: truck,
//                         bus_type: bus
//                     })
//                 }
//             })
//         }
//     });
//         connection.release();
//     });
// });


//Customer getting Vehicle typeof

apiRoutes.post('/vehicletype',function(req,res){
    
    var customer_id = req.headers['id'];

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }



    connection.query('SELECT * FROM vehicle_type',function(err,vehicle){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: vehicle
            })
        }
    })


        connection.release();
    })

})









// Customer Booking for Job - With Notification

apiRoutes.post('/booking',function(req,res){

    var customer_id = req.headers['id'];
    var pickup_location = req.headers['pickup_location'] || req.body.pickup_location ;
    var pickup_latitude = req.headers['pickup_latitude'] || req.body.pickup_latitude ;
    var pickup_longitude = req.headers['pickup_longitude'] || req.body.pickup_longitude ;
    var drop_location = req.headers['drop_location'] || req.body.drop_location ;
    var drop_latitude = req.headers['drop_latitude'] || req.body.drop_latitude ;
    var drop_longitude = req.headers['drop_longitude'] || req.body.drop_longitude ;
    var goods_type = req.headers['goods_type'] || req.body.goods_type ;
    var vehicle_type = req.headers['vehicle_type'] || req.body.vehicle_type;
    var vehicle_main_type = req.headers['vehicle_main_type'] || req.body.vehicle_main_type;
    var vehicle_sub_type = req.headers['vehicle_sub_type'] || req.body.vehicle_sub_type ;                             //Previously truck_type
    var description = req.headers['description'] || req.body.description ;
    var booking_time = req.headers['booking_time'] || req.body.booking_time ;
    var delivery_address = req.headers['delivery_address'] || req.body.delivery_address ;

    var radius = req.body.radius;
  

    pool.getConnection(function(err,connection){
        if(err) throw err ;


    bookinggoodsupload(req,res,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{

                                         
//bookinggoods 
                                if(req.files == undefined){
                                    function bookingGoods1(){
                                        return bookinggoods1 = "null" ;
                                    }
                                    function bookingGoods2(){
                                        return bookinggoods2 = "null" ;
                                    }
                                    function bookingGoods3(){
                                        return bookinggoods3 = "null";
                                    }
                                    function bookingGoods4(){
                                        return bookinggoods4 = "null";
                                    }
                                    function bookingGoods5(){
                                        return bookinggoods5 = "null";
                                    }
                                        var bookinggoods1 = bookingGoods1()
                                        var bookinggoods2 = bookingGoods2()
                                        var bookinggoods3 = bookingGoods3()
                                        var bookinggoods4 = bookingGoods4()
                                        var bookinggoods5 = bookingGoods5()
                                }else if(req.files.length == 1){
//bookinggoods1  
                                        function bookingGoods1(){
                                        if(typeof req.files[0].filename !== undefined){
                                        return bookinggoods1 = req.files[0].filename
                                        }
                                        }
                                var bookinggoods1 = bookingGoods1()
                                }else if(req.files.length == 2){
//bookinggoods2
                                        function bookingGoods1(){
                                        if(typeof req.files[0].filename !== undefined){
                                        return bookinggoods1 = req.files[0].filename
                                        }
                                        }
//bookinggoods2 
                                        function bookingGoods2(){      
                                        if(typeof req.files[1].filename !== undefined){
                                        return bookinggoods2 = req.files[1].filename
                                        }
                                        }
                                        var bookinggoods1 = bookingGoods1()
                                        var bookinggoods2 = bookingGoods2()
                                }else if(req.files.length == 3){

                                         function bookingGoods1(){
                                        if(typeof req.files[0].filename !== undefined){
                                        return bookinggoods1 = req.files[0].filename
                                        }
                                        }
//bookinggoods2 
                                        function bookingGoods2(){      
                                        if(typeof req.files[1].filename !== undefined){
                                        return bookinggoods2 = req.files[1].filename
                                        }
                                        }
                                        
                                        function bookingGoods3(){      
                                        if(typeof req.files[2].filename !== undefined){
                                        return bookinggoods3 = req.files[2].filename
                                        }
                                        }

                                        var bookinggoods1 = bookingGoods1()
                                        var bookinggoods2 = bookingGoods2()
                                        var bookinggoods3 = bookingGoods3()

                                    }else if(req.files.length == 4){


                                        function bookingGoods1(){
                                        if(typeof req.files[0].filename !== undefined){
                                        return bookinggoods1 = req.files[0].filename
                                        }
                                        }
//bookinggoods2 
                                        function bookingGoods2(){      
                                        if(typeof req.files[1].filename !== undefined){
                                        return bookinggoods2 = req.files[1].filename
                                        }
                                        }
                                        
                                        function bookingGoods3(){      
                                        if(typeof req.files[2].filename !== undefined){
                                        return bookinggoods3 = req.files[2].filename
                                        }
                                        }
                                    
                                        function bookingGoods4(){
                                        if(typeof req.files[3].filename !== undefined){
                                        return bookinggoods4 = req.files[3].filename
                                        }
                                        }

                                        var bookinggoods1 = bookingGoods1()
                                        var bookinggoods2 = bookingGoods2()
                                        var bookinggoods3 = bookingGoods3()
                                        var bookinggoods4 = bookingGoods4()
                                    }else if(req.files.length == 5){

                                        function bookingGoods1(){
                                        if(typeof req.files[0].filename !== undefined){
                                        return bookinggoods1 = req.files[0].filename
                                        }
                                        }
//bookinggoods2 
                                        function bookingGoods2(){      
                                        if(typeof req.files[1].filename !== undefined){
                                        return bookinggoods2 = req.files[1].filename
                                        }
                                        }
                                        
                                        function bookingGoods3(){      
                                        if(typeof req.files[2].filename !== undefined){
                                        return bookinggoods3 = req.files[2].filename
                                        }
                                        }
                                    
                                        function bookingGoods4(){
                                        if(typeof req.files[3].filename !== undefined){
                                        return bookinggoods4 = req.files[3].filename
                                        }
                                        }
                                    
                                        function bookingGoods5(){
                                        if(typeof req.files[4].filename !== undefined){
                                        return bookinggoods5 = req.files[4].filename
                                        }
                                        }

                                        var bookinggoods1 = bookingGoods1()
                                        var bookinggoods2 = bookingGoods2()
                                        var bookinggoods3 = bookingGoods3()
                                        var bookinggoods4 = bookingGoods4()
                                        var bookinggoods5 = bookingGoods5()
                                        }else{
                                    console.log("No Goods Image has been attached");
                                }



            connection.query('INSERT INTO bookings SET customer_id = ?,pickup_location = ?,pickup_latitude = ?,pickup_longitude = ?,drop_location = ?,drop_latitude = ?,drop_longitude = ?,delivery_address = ?, goods_type = ?,vehicle_type = ?,vehicle_main_type = ?,vehicle_sub_type = ?,description = ?,booking_time = ?,radius = ?,job_status = ?,goods_image1 = ?,goods_image2 = ?,goods_image3 = ?,goods_image4 = ?,goods_image5 = ?',[customer_id,pickup_location,pickup_latitude,pickup_longitude,drop_location,drop_latitude,drop_longitude,delivery_address,goods_type,vehicle_type,vehicle_main_type,vehicle_sub_type,description,booking_time,"ten","waiting",bookinggoods1,bookinggoods2,bookinggoods3,bookinggoods4,bookinggoods5],function(err,book){


                if(err){
                    res.json({
                        status :false,
                        message : "Error Occured" + err
                    })
                }else{

                    let booking_id = book.insertId;

                    let latitude = pickup_latitude;

                    let longitude = pickup_longitude;



                     connection.query('SELECT driver_location.driver_id,driver_location.driver_latitude,driver_location.driver_longitude,driver.driver_id,driver.fcm_id,driver.driver_status, ( 3959 * acos( cos( radians(' + latitude + ') ) * cos( radians( driver_latitude ) ) * cos( radians( driver_longitude ) - radians(' + longitude + ') ) + sin( radians(' + latitude + ') ) * sin( radians( driver_latitude ) ) ) ) AS distance FROM driver_location INNER JOIN driver ON driver_location.driver_id = driver.driver_id WHERE driver.driver_status = ? HAVING distance <' + radius + ' ORDER BY distance LIMIT 0 ,20',["active"],function(err,location){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            });
        }else{


                var message = {
                            title: "New Job",
                            body: "A New job is waiting for bidding",
                            // customer_name : customer_name
                    }




             function sendMessage(deviceid,message,success){

                        request({
                            url: 'https://fcm.googleapis.com/fcm/send',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'key='+serverkey
                            },
                            body: JSON.stringify({
                                notification: {
                                    body: message
                                },
                                to: deviceid
                            })
                        },function(err,response,body){
                            if(err){
                                res.json({
                                    status: false,
                                    message: "Error Occured" + err
                                });
                            }else if(response.statusCode >= 400){
                                // res.json({
                                //     Error: response.statusCode + '-' +response.statusMessage + '\n' + response.body
                                // });

                                console.log(response.statusMessage)
                            }else{
                               console.log("done")
                            }
                        })

                    }

            for(i in location){
                sendMessage((location[i].fcm_id),message);
            }


                     

                    res.json({
                        status : true,
                        message : "Your Post has been added successfully",
                        booking_id : booking_id
                    });

        }
    })









                   



                }
        });

        }
    })

            connection.release();
    })
})






// // Customer Booking for Job - OLD Without Notification

// apiRoutes.post('/booking',function(req,res){

//     var customer_id = req.headers['id'];
//     var pickup_location = req.headers['pickup_location'] || req.body.pickup_location ;
//     var pickup_latitude = req.headers['pickup_latitude'] || req.body.pickup_latitude ;
//     var pickup_longitude = req.headers['pickup_longitude'] || req.body.pickup_longitude ;
//     var drop_location = req.headers['drop_location'] || req.body.drop_location ;
//     var drop_latitude = req.headers['drop_latitude'] || req.body.drop_latitude ;
//     var drop_longitude = req.headers['drop_longitude'] || req.body.drop_longitude ;
//     var goods_type = req.headers['goods_type'] || req.body.goods_type ;
//     var vehicle_type = req.headers['vehicle_type'] || req.body.vehicle_type;
//     var vehicle_main_type = req.headers['vehicle_main_type'] || req.body.vehicle_main_type;
//     var vehicle_sub_type = req.headers['vehicle_sub_type'] || req.body.vehicle_sub_type ;                             //Previously truck_type
//     var description = req.headers['description'] || req.body.description ;
//     var booking_time = req.headers['booking_time'] || req.body.booking_time ;
//     var delivery_address = req.headers['delivery_address'] || req.body.delivery_address ;
  

//     pool.getConnection(function(err,connection){
//         if(err) throw err ;


//     bookinggoodsupload(req,res,function(err){
//         if(err){
//             res.json({
//                 status : false,
//                 message : "Error Occured" + err
//             });
//         }else{

                                         
// //bookinggoods 
//                                 if(req.files == undefined){
//                                     function bookingGoods1(){
//                                         return bookinggoods1 = "null" ;
//                                     }
//                                     function bookingGoods2(){
//                                         return bookinggoods2 = "null" ;
//                                     }
//                                     function bookingGoods3(){
//                                         return bookinggoods3 = "null";
//                                     }
//                                     function bookingGoods4(){
//                                         return bookinggoods4 = "null";
//                                     }
//                                     function bookingGoods5(){
//                                         return bookinggoods5 = "null";
//                                     }
//                                         var bookinggoods1 = bookingGoods1()
//                                         var bookinggoods2 = bookingGoods2()
//                                         var bookinggoods3 = bookingGoods3()
//                                         var bookinggoods4 = bookingGoods4()
//                                         var bookinggoods5 = bookingGoods5()
//                                 }else if(req.files.length == 1){
// //bookinggoods1  
//                                         function bookingGoods1(){
//                                         if(typeof req.files[0].filename !== undefined){
//                                         return bookinggoods1 = req.files[0].filename
//                                         }
//                                         }
//                                 var bookinggoods1 = bookingGoods1()
//                                 }else if(req.files.length == 2){
// //bookinggoods2
//                                         function bookingGoods1(){
//                                         if(typeof req.files[0].filename !== undefined){
//                                         return bookinggoods1 = req.files[0].filename
//                                         }
//                                         }
// //bookinggoods2 
//                                         function bookingGoods2(){      
//                                         if(typeof req.files[1].filename !== undefined){
//                                         return bookinggoods2 = req.files[1].filename
//                                         }
//                                         }
//                                         var bookinggoods1 = bookingGoods1()
//                                         var bookinggoods2 = bookingGoods2()
//                                 }else if(req.files.length == 3){

//                                          function bookingGoods1(){
//                                         if(typeof req.files[0].filename !== undefined){
//                                         return bookinggoods1 = req.files[0].filename
//                                         }
//                                         }
// //bookinggoods2 
//                                         function bookingGoods2(){      
//                                         if(typeof req.files[1].filename !== undefined){
//                                         return bookinggoods2 = req.files[1].filename
//                                         }
//                                         }
                                        
//                                         function bookingGoods3(){      
//                                         if(typeof req.files[2].filename !== undefined){
//                                         return bookinggoods3 = req.files[2].filename
//                                         }
//                                         }

//                                         var bookinggoods1 = bookingGoods1()
//                                         var bookinggoods2 = bookingGoods2()
//                                         var bookinggoods3 = bookingGoods3()

//                                     }else if(req.files.length == 4){


//                                         function bookingGoods1(){
//                                         if(typeof req.files[0].filename !== undefined){
//                                         return bookinggoods1 = req.files[0].filename
//                                         }
//                                         }
// //bookinggoods2 
//                                         function bookingGoods2(){      
//                                         if(typeof req.files[1].filename !== undefined){
//                                         return bookinggoods2 = req.files[1].filename
//                                         }
//                                         }
                                        
//                                         function bookingGoods3(){      
//                                         if(typeof req.files[2].filename !== undefined){
//                                         return bookinggoods3 = req.files[2].filename
//                                         }
//                                         }
                                    
//                                         function bookingGoods4(){
//                                         if(typeof req.files[3].filename !== undefined){
//                                         return bookinggoods4 = req.files[3].filename
//                                         }
//                                         }

//                                         var bookinggoods1 = bookingGoods1()
//                                         var bookinggoods2 = bookingGoods2()
//                                         var bookinggoods3 = bookingGoods3()
//                                         var bookinggoods4 = bookingGoods4()
//                                     }else if(req.files.length == 5){

//                                         function bookingGoods1(){
//                                         if(typeof req.files[0].filename !== undefined){
//                                         return bookinggoods1 = req.files[0].filename
//                                         }
//                                         }
// //bookinggoods2 
//                                         function bookingGoods2(){      
//                                         if(typeof req.files[1].filename !== undefined){
//                                         return bookinggoods2 = req.files[1].filename
//                                         }
//                                         }
                                        
//                                         function bookingGoods3(){      
//                                         if(typeof req.files[2].filename !== undefined){
//                                         return bookinggoods3 = req.files[2].filename
//                                         }
//                                         }
                                    
//                                         function bookingGoods4(){
//                                         if(typeof req.files[3].filename !== undefined){
//                                         return bookinggoods4 = req.files[3].filename
//                                         }
//                                         }
                                    
//                                         function bookingGoods5(){
//                                         if(typeof req.files[4].filename !== undefined){
//                                         return bookinggoods5 = req.files[4].filename
//                                         }
//                                         }

//                                         var bookinggoods1 = bookingGoods1()
//                                         var bookinggoods2 = bookingGoods2()
//                                         var bookinggoods3 = bookingGoods3()
//                                         var bookinggoods4 = bookingGoods4()
//                                         var bookinggoods5 = bookingGoods5()
//                                         }else{
//                                     console.log("No Goods Image has been attached");
//                                 }



//             connection.query('INSERT INTO bookings SET customer_id = ?,pickup_location = ?,pickup_latitude = ?,pickup_longitude = ?,drop_location = ?,drop_latitude = ?,drop_longitude = ?,delivery_address = ?, goods_type = ?,vehicle_type = ?,vehicle_main_type = ?,vehicle_sub_type = ?,description = ?,booking_time = ?,radius = ?,job_status = ?,goods_image1 = ?,goods_image2 = ?,goods_image3 = ?,goods_image4 = ?,goods_image5 = ?',[customer_id,pickup_location,pickup_latitude,pickup_longitude,drop_location,drop_latitude,drop_longitude,delivery_address,goods_type,vehicle_type,vehicle_main_type,vehicle_sub_type,description,booking_time,"ten","waiting",bookinggoods1,bookinggoods2,bookinggoods3,bookinggoods4,bookinggoods5],function(err,book){


//                 if(err){
//                     res.json({
//                         status :false,
//                         message : "Error Occured" + err
//                     })
//                 }else{
//                     res.json({
//                         status : true,
//                         message : "Your Post has been added successfully",
//                         booking_id : book.insertId
//                     });
//                 }
//         });

//         }
//     })

//             connection.release();
//     })
// })




//Emergency Booking


apiRoutes.post('/emergencybooking',function(req,res){


    var customer_id = req.headers['id'];
    var pickup_location = req.headers['pickup_location'] || req.body.pickup_location ;
    var pickup_latitude = req.headers['pickup_latitude'] || req.body.pickup_latitude ;
    var pickup_longitude = req.headers['pickup_longitude'] || req.body.pickup_longitude ;
    var drop_location = req.headers['drop_location'] || req.body.drop_location ;
    var drop_latitude = req.headers['drop_latitude'] || req.body.drop_latitude ;
    var drop_longitude = req.headers['drop_longitude'] || req.body.drop_longitude ;
    var goods_type = req.headers['goods_type'] || req.body.goods_type ;
    var vehicle_type = req.headers['vehicle_type'] || req.body.vehicle_type;
    var vehicle_main_type = req.headers['vehicle_main_type'] || req.body.vehicle_main_type;
    var vehicle_sub_type = req.headers['vehicle_sub_type'] || req.body.vehicle_sub_type ;                             //Previously truck_type
    var description = req.headers['description'] || req.body.description ;
    var booking_time = req.headers['booking_time'] || req.body.booking_time ;
    var delivery_address = req.headers['delivery_address'] || req.body.delivery_address ;
  


    
    // M = 3959
    // K = 6371



    function getDistanceFromLatLonInMile(lat1,lon1,lat2,lon2) {
        var R = 3959; 
        var dLat = deg2rad(lat2-lat1);  
        var dLon = deg2rad(lon2-lon1); 
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; 
        return d;
   }


  


    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    
    var distance = getDistanceFromLatLonInMile(pickup_latitude,pickup_longitude,drop_latitude,drop_longitude);
    var price = Math.ceil(distance * 250);




    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting database"
            })
        }



            connection.query('INSERT INTO bookings SET customer_id = ?,pickup_location = ?,pickup_latitude = ?,pickup_longitude = ?,drop_location = ?,drop_latitude = ?,drop_longitude = ?,delivery_address = ?, goods_type = ?,vehicle_type = ?,vehicle_main_type = ?,vehicle_sub_type = ?,description = ?,booking_time = ?,radius = ?,job_status = ?,job_cost = ?',[customer_id,pickup_location,pickup_latitude,pickup_longitude,drop_location,drop_latitude,drop_longitude,delivery_address,goods_type,vehicle_type,vehicle_main_type,vehicle_sub_type,description,booking_time,"ten","waiting",price],function(err,book){


                if(err){
                    res.json({
                        status :false,
                        message : "Error Occured" + err
                    })
                }else{
                    res.json({
                        status : true,
                        message : "Your Post has been added successfully",
                        booking_id : book.insertId,
                        price : price
                    });

                }
        });

        connection.release();
    })


})






//Customer Reviewing Jobs

apiRoutes.post('/showcurrentjob',function(req,res){

    var customer_id = req.headers['id'];
    
    var booking_id = req.body.booking_id ;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code : 100,
                message : "Error in connecting Database"
            })
        }

    
    connection.query('SELECT * FROM bookings WHERE booking_id = ?',[booking_id],function(err,job){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                jobs : job
            });
        }

    });

        connection.release();
    })
});




// //Customer viewing Bidding/Drivers List

// apiRoutes.post('/driverslist',function(req,res){

//     var customer_id = req.headers['id'];

//     var booking_id = req.body.booking_id ;

//     pool.getConnection(function(err,connection){
//         if(err){
//             res.json({
//                 code : 100,
//                 message : "Error in connecting Database"
//             })
//         }

    
//     connection.query('SELECT * FROM job_bidding WHERE booking_id = ?',[booking_id],function(err,job){
//         if(err) throw err ;

//         if(job == 0){
//             res.json({
//                 status : false,
//                 message : "No job listed here"
//             })
//         }else if(job != 0){

// //Driver Id
//                   function driverId(){
//                   var driver_id = [];

//                   for(var i=0;i<job.length;i++){
//                              driver_id.push(job[i].driver_id) ;
//                   }
//                   return  driver_id ;
//                   }  

//                   console.log(driverId().join())
// // //Booking Id
// //                   function bookingId(){
// //                       var booking_id = [];
                  
// //                   for(var i=0;i<job.length;i++){
// //                       booking_id.push(job[i].booking_id);
// //                   }
// //                   return booking_id ;
// //                   }           


//     connection.query('SELECT driver.driver_id,driver.driver_image,driver.driver_name,driver.driver_rating,truck.truck_id,truck.truck_type,truck.truck_image_front,truck.truck_image_back,truck.truck_image_side,truck.damage_control FROM driver,truck WHERE driver.driver_id = ?',[driverId().join()],function(err,details){
    
    
//         if(err){
//             res.json({
//                 status : false,
//                 message : "Error Occured" + err
//             });
//         }else{
//             res.json({
//                 status : true,
//                 message : details
//             })
//         }
//     });
//                     }
           

//     });

//         connection.release();
//     })
// });





//Customer viewing Bidding/Drivers List

apiRoutes.post('/driverslist',function(req,res){

    var customer_id = req.headers['id'];

    var booking_id = req.body.booking_id ;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code : 100,
                message : "Error in connecting Database"
            })
        }

    
    connection.query('SELECT job_bidding.booking_id,job_bidding.bidding_cost,job_bidding.bidding_id,driver.driver_id,driver.driver_image,driver.driver_name,driver.driver_rating,driver.driver_job_status,driver.finished_jobs,truck.truck_id,truck.truck_type,truck.truck_image_front,truck.truck_image_back,truck.truck_image_side,truck.damage_control FROM job_bidding INNER JOIN driver ON job_bidding.driver_id = driver.driver_id INNER JOIN truck ON job_bidding.driver_id = truck.driver_id WHERE job_bidding.booking_id = ? ORDER BY job_bidding.booking_id DESC',[booking_id],function(err,job){
        if(err) throw err ;

        if(job == 0){
            res.json({
                status : false,
                message : "No job listed here"
            })
        }else if(job != 0){
            res.json({
                status : true,
                message : job
            })
        } 
    });

        connection.release();
    })
});


//Customer viewing Bidding/Drivers List - BUS

apiRoutes.post('/driverslistbus',function(req,res){

    var customer_id = req.headers['id'];

    var booking_id = req.body.booking_id ;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code : 100,
                message : "Error in connecting Database"
            })
        }

    
    connection.query('SELECT job_bidding.booking_id,job_bidding.bidding_cost,job_bidding.bidding_id,driver.driver_id,driver.driver_image,driver.driver_name,driver.driver_rating,driver.driver_job_status,driver.finished_jobs,bus.bus_id,bus.bus_type,bus.bus_image_front,bus.bus_image_back,bus.bus_image_side,bus.damage_control FROM job_bidding INNER JOIN driver ON job_bidding.driver_id = driver.driver_id INNER JOIN bus ON job_bidding.driver_id = bus.driver_id WHERE job_bidding.booking_id = ? ORDER BY job_bidding.booking_id DESC',[booking_id],function(err,job){
        if(err) throw err ;

        if(job == 0){
            res.json({
                status : false,
                message : "No job listed here"
            })
        }else if(job != 0){
            res.json({
                status : true,
                message : job
            })
        } 
    });

        connection.release();
    })
});




// //Notification Trial

// apiRoutes.post('/notify',function(req,res){
    
//     var deviceId = req.body.device_id;

//     var message = {
//                 title: 'Movehaul Push Test',
//                 body: 'Movehaul Push Notification Test Message'
//     };


//     function sendMessage(deviceid,message,success){
        
//         request({
//             url: 'https://fcm.googleapis.com/fcm/send',
//             method: 'POST',
//             headers: {
//                 'Content-Type' : 'application/json',
//                 'Authorization' : 'key='+serverkey
//             },
//             body: JSON.stringify({
//                 notification: {
//                     body: message
//                 },
//                 to: deviceid
//             })
//         },function(err,response,body){
//             if(err){
//                 res.json({
//                     status: false,
//                     message: "Error Occured "+ err
//                 });
//             }else if (response.statusCode >= 400) { 
//            res.json({
//                Error: response.statusCode +' - ' +response.statusMessage +'\n'+ response.body 
//            }); 
//             }else{
//                 res.json({
//                     status: true,
//                     message: response
//                 })
//             }
//         })

//     }

// sendMessage(deviceId,message);


// });


//Confirming payment to driver

apiRoutes.post('/payment',function(req,res){

    var customer_id = req.headers['id'];

    var driver_id = req.body.driver_id ;
    var bidding_id = req.body.bidding_id ;
    var transaction_id = req.body.transaction_id ;
    var booking_id = req.body.booking_id ;
    var receiver_name = req.body.receiver_name;
    var receiver_phone = req.body.receiver_phone;
    
    var confirmed_time = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss a') ;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }

    connection.query('SELECT bidding_cost FROM job_bidding WHERE bidding_id = ?',[bidding_id],function(err,bidding){
        if(err){
            res.json({
                status: false,
                message: "Error Occured" + err
            });
        }else{
            var job_cost = bidding[0].bidding_cost;

    connection.query('UPDATE bookings SET driver_id = ?,bidding_id = ?,transaction_id = ?,job_cost = ?,job_status = ?,confirmed_time = ?,receiver_name = ?,receiver_phone = ? WHERE booking_id = ?',[driver_id,bidding_id,transaction_id,job_cost,"confirmed",confirmed_time,receiver_name,receiver_phone,booking_id],function(err,payment){
        if(err){
            res.json({
                status: false,
                message: "Error Occured" + err
            });
        }else{

            connection.query('UPDATE driver SET driver_job_status = ? WHERE driver_id = ?',["booked",driver_id],function(err,driver){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured" + err
                    })
                }else{
                    

                         connection.query('SELECT driver.fcm_id,customer.customer_name FROM driver,customer WHERE driver.driver_id = ? AND customer.customer_id = ?',[driver_id,customer_id],function(err,fcm){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured" + err
                    });
                }else{

                    var fcm_id = fcm[0].fcm_id ;

                    var customer_name = fcm[0].customer_name ;
                   
                    var message = {
                            title: "Job Confirmed",
                            body: "Your job bidding was Booked",
                            customer_name : customer_name
                    }


                    function sendMessage(deviceid,message,success){

                        request({
                            url: 'https://fcm.googleapis.com/fcm/send',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'key='+serverkey
                            },
                            body: JSON.stringify({
                                notification: {
                                    body: message
                                },
                                to: deviceid
                            })
                        },function(err,response,body){
                            if(err){
                                res.json({
                                    status: false,
                                    message: "Error Occured" + err
                                });
                            }else if(response.statusCode >= 400){
                                res.json({
                                    Error: response.statusCode + '-' +response.statusMessage + '\n' + response.body
                                });
                            }else{
                                res.json({
                                    status: true
                               //   message: response
                                })
                            }
                        })

                    }

                sendMessage(fcm_id,message);

                }
            })

                }

            })

        }
    })

        }

    })

     connection.release();
    })


});



//Emergency payment



apiRoutes.post('/emergencypayment',function(req,res){

    var customer_id = req.headers['id'];

    var transaction_id = req.body.transaction_id;
    var booking_id = req.body.booking_id;

    var confirmed_time = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss a')


    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in Connecting Database"
            })
        }

    
    connection.query('SELECT pickup_latitude,pickup_longitude FROM bookings WHERE booking_id = ?',[booking_id],function(err,booking){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err 
            })
        }else{

          var latitude = booking[0].pickup_latitude;
          var longitude = booking[0].pickup_longitude;
          var radius = 100;
         


    connection.query('SELECT driver.driver_name,driver.driver_email,driver_location.driver_id,driver_location.driver_latitude,driver_location.driver_longitude, ( 3959 * acos( cos( radians(' + latitude + ') ) * cos( radians( driver_location.driver_latitude ) ) * cos( radians( driver_location.driver_longitude ) - radians(' + longitude + ') ) + sin( radians(' + latitude + ') ) * sin( radians( driver_location.driver_latitude ) ) ) ) AS distance FROM driver_location INNER JOIN driver ON driver_location.driver_id = driver.driver_id WHERE driver.vehicle_type = ? HAVING distance <' + radius + ' ORDER BY distance LIMIT 0 ,1',["Road"],function(err,driver){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            });
        }else{

            var driver_id = driver[0].driver_id;


            connection.query('UPDATE bookings SET driver_id = ?,transaction_id = ?,job_status = ?,confirmed_time = ? WHERE booking_id = ?',[driver_id,transaction_id,"confirmed",confirmed_time,booking_id],function(err,payment){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{

                    connection.query('UPDATE driver SET driver_job_status = ? WHERE driver_id = ?',["booked",driver_id],function(err,drivernew){
                        if(err){
                            res.json({
                                status: false,
                                message: "Error Occured " + err
                            })
                        }else{

                            connection.query('SELECT driver.fcm_id,customer.customer_name FROM driver,customer WHERE driver.driver_id = ? AND customer.customer_id = ?',[driver_id,customer_id],function(err,fcm){
                                if(err){
                                    res.json({
                                        status: false,
                                        message: "Error Occured " + err
                                    })
                                }else{

                                    var fcm_id = fcm[0].fcm_id;

                                    var customer_name = fcm[0].customer_name ;

                                    var message = {
                                        title: "Job Confirmed",
                                        body: "Emergency Request",
                                        customer_name: customer_name
                                    }

                                    function sendMessage(deviceid,message,success){

                                        request({
                                            url: 'https://fcm.googleapis.com/fcm/send',
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': 'key='+serverkey
                                            },body: JSON.stringify({
                                                notification: {
                                                    body: message
                                                },
                                                to: deviceid
                                            })
                                        },function(err,response,body){
                                            if(err){
                                                res.json({
                                                    status: false,
                                                    message: "Error Occured " + err
                                                })
                                            }else if(response.statusCode >= 400){
                                                res.json({
                                                     Error: response.statusCode + '-' +response.statusMessage + '\n' + response.body
                                                })
                                            }else{
                                res.json({
                                    status: true
                               //   message: response
                                })
                            }
                                        })

                                    }
                            sendMessage(fcm_id,message);
                                }
                            })
                        }
                    })

                }
            })



        }
    })



        }

    })




        connection.release();
    })


})







//customer viewing job history

apiRoutes.post('/jobhistory',function(req,res){

    var customer_id = req.headers['id'];
    
    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code: 100,
                message: 'Error in connecting Database'
            });
        }


    connection.query('SELECT bookings.*,driver_location.*,driver.driver_id,driver.driver_name,driver.driver_mobile_pri,driver.driver_mobile_sec,driver.driver_image FROM bookings INNER JOIN driver ON bookings.driver_id = driver.driver_id INNER JOIN driver_location ON driver_location.driver_id = driver.driver_id WHERE customer_id = ? ORDER BY bookings.booking_id DESC',[customer_id],function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured" + err
            });
        }else{
            res.json({
                status: true,
                message: info
            })
        }
    });

    connection.release();
    })

})


//waiting jobs




apiRoutes.post('/waitingjobs',function(req,res){

    var customer_id = req.headers['id'];

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }
    
    connection.query('SELECT booking_id,pickup_location,drop_location,booking_time,(SELECT COUNT(bidding_id) FROM job_bidding WHERE job_bidding.booking_id = bookings.booking_id)count FROM bookings WHERE customer_id = ? AND job_status = ?',[customer_id,"waiting",],function(err,bookings){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
               res.json({
                   status: true,
                   message: bookings
               })
        }
    })



        connection.release();
    })
    
})









// Nearby Drivers


apiRoutes.post('/nearbydrivers',function(req,res){

    var customer_id = req.headers['id'];

    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var radius = req.body.radius;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code: 100,
                message: "Error in connecting database"
            })
        }

    
    connection.query('SELECT driver_id,driver_latitude,driver_longitude, ( 3959 * acos( cos( radians(' + latitude + ') ) * cos( radians( driver_latitude ) ) * cos( radians( driver_longitude ) - radians(' + longitude + ') ) + sin( radians(' + latitude + ') ) * sin( radians( driver_latitude ) ) ) ) AS distance FROM driver_location HAVING distance <' + radius + ' ORDER BY distance LIMIT 0 ,20',function(err,location){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            });
        }else{
            res.json({
                status: true,
                message: location
            })
        }
    })




    connection.release();
    })


})




//Customer Deleting his bookings



apiRoutes.post('/deletebooking',function(req,res){

    var customer_id = req.headers['id'];
    var booking_id = req.body.booking_id;


    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }


    connection.query('DELETE FROM bookings WHERE booking_id = ?',[booking_id],function(err,done){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: "Your Booking has been successfully deleted"
            })
        }
    })


        connection.release();
    })
})


// Cancel job


apiRoutes.post('/canceljob',function(req,res){

    var customer_id = req.headers['id'];
    var driver_id = req.body.driver_id;
    var booking_id = req.body.booking_id;

    var cancelled_time = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss')

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }
            
        
    connection.query('UPDATE bookings SET job_status = ?,cancelled_time = ? WHERE booking_id = ?',["cancelled",cancelled_time,booking_id],function(err,cancelled){
        if(err){
            res.json({
                status: false,
                message: "Error occured " + err
            })
        }else{
            
            

             connection.query('SELECT driver.fcm_id,customer.customer_name FROM driver,customer WHERE driver.driver_id = ? AND customer.customer_id = ?',[driver_id,customer_id],function(err,fcm){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured" + err
                    });
                }else{

                    var fcm_id = fcm[0].fcm_id ;

                    var customer_name = fcm[0].customer_name ;
                   
                    var message = {
                            title: "Job Cancelled",
                            body: "Your current job has been cancelled by the customer",
                            customer_name : customer_name
                    }


                    function sendMessage(deviceid,message,success){

                        request({
                            url: 'https://fcm.googleapis.com/fcm/send',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'key='+serverkey
                            },
                            body: JSON.stringify({
                                notification: {
                                    body: message
                                },
                                to: deviceid
                            })
                        },function(err,response,body){
                            if(err){
                                res.json({
                                    status: false,
                                    message: "Error Occured" + err
                                });
                            }else if(response.statusCode >= 400){
                                res.json({
                                    Error: response.statusCode + '-' +response.statusMessage + '\n' + response.body
                                });
                            }else{
                                res.json({
                                    status: true
                               //   message: response
                                })
                            }
                        })

                    }

                sendMessage(fcm_id,message);

                }
            })
         




        }
    })




       
       connection.release();
    })

})



// // Nearby Drivers


// app.post('/nearbydriversnotify',function(req,res){

//     var customer_id = req.headers['id'];

//     var latitude = req.body.latitude;
//     var longitude = req.body.longitude;
//     var radius = req.body.radius;

//     pool.getConnection(function(err,connection){
//         if(err){
//             res.json({
//                 code: 100,
//                 message: "Error in connecting database"
//             })
//         }

    
//     connection.query('SELECT driver_location.driver_id,driver_location.driver_latitude,driver_location.driver_longitude,driver.driver_id,driver.fcm_id,driver.driver_status, ( 3959 * acos( cos( radians(' + latitude + ') ) * cos( radians( driver_latitude ) ) * cos( radians( driver_longitude ) - radians(' + longitude + ') ) + sin( radians(' + latitude + ') ) * sin( radians( driver_latitude ) ) ) ) AS distance FROM driver_location INNER JOIN driver ON driver_location.driver_id = driver.driver_id WHERE driver.driver_status = ? HAVING distance <' + radius + ' ORDER BY distance LIMIT 0 ,20',["active"],function(err,location){
//         if(err){
//             res.json({
//                 status: false,
//                 message: "Error Occured " + err
//             });
//         }else{


//                 var message = {
//                             title: "New Job",
//                             body: "A New job is waiting for bidding",
//                             // customer_name : customer_name
//                     }




//              function sendMessage(deviceid,message,success){

//                         request({
//                             url: 'https://fcm.googleapis.com/fcm/send',
//                             method: 'POST',
//                             headers: {
//                                 'Content-Type': 'application/json',
//                                 'Authorization': 'key='+serverkey
//                             },
//                             body: JSON.stringify({
//                                 notification: {
//                                     body: message
//                                 },
//                                 to: deviceid
//                             })
//                         },function(err,response,body){
//                             if(err){
//                                 res.json({
//                                     status: false,
//                                     message: "Error Occured" + err
//                                 });
//                             }else if(response.statusCode >= 400){
//                                 // res.json({
//                                 //     Error: response.statusCode + '-' +response.statusMessage + '\n' + response.body
//                                 // });

//                                 console.log(response.statusMessage)
//                             }else{
//                                console.log("done")
//                             }
//                         })

//                     }

//             for(i in location){
//                 sendMessage((location[i].fcm_id),message);
//             }


                     

//             res.json({
//                 status: true,
//                 message: location
//             })
//         }
//     })




//     connection.release();
//     })


// })




// app.post('/driverslist',function(req,res){

//     var customer_id = req.headers['id'];

//     var booking_id = req.body.booking_id ;

//     pool.getConnection(function(err,connection){
//         if(err){
//             res.json({
//                 code : 100,
//                 message : "Error in connecting Database"
//             })
//         }

    
//     connection.query('SELECT job_bidding.booking_id,job_bidding.bidding_cost,job_bidding.bidding_id,driver.driver_id,driver.driver_image,driver.driver_name,driver.driver_rating,driver.driver_job_status,truck.truck_id,truck.truck_type,truck.truck_image_front,truck.truck_image_back,truck.truck_image_side,truck.damage_control FROM job_bidding INNER JOIN driver ON job_bidding.driver_id = driver.driver_id INNER JOIN truck ON job_bidding.driver_id = truck.driver_id WHERE job_bidding.booking_id = ?',[booking_id],function(err,job){
//         if(err) throw err ;

//         if(job == 0){
//             res.json({
//                 status : false,
//                 message : "No job listed here"
//             })
//         }else if(job != 0){
//             res.json({
//                 status : true,
//                 message : job
//             })
//         } 
//     });

//         connection.release();
//     })
// });














app.use('/customer',apiRoutes);

};





 