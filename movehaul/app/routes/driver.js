var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var moment = require('moment');
var multer = require('multer');
var mime = require('mime');
var nodemailer = require('nodemailer');

var verifier = require('email-verify');

var pool = require('../connection');


//Twilio Configuration

var twilio = require('twilio');

var accountSid = 'AC78e3aefc278a8184d567d7041b97bb20';
var authToken = 'aa199ed7aa3914d3fe9e3583ad8a6f20';

var client = twilio(accountSid,authToken);

//Nodemailer Configuration

var smtpTransport = nodemailer.createTransport('smtps://movehaul.developer%40gmail.com:Noble_123@smtp.gmail.com');


//Driver Licence Image

var driverlicencestorage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/driverdetails');
    },
    filename : function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});

var driverlicenceupload = multer({                  
    storage : driverlicencestorage
}).array('driverlicence',1);

//Driver Update

var driverupdatestorage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/driverdetails');
    },
    filename : function(req,file,cb){
        var datetimestamp = Date.now();
        var userid = req.headers['id'];
        cb(null,userid + '-' +file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});

var driverupdateupload = multer({
    storage : driverupdatestorage
}).array('driverimage', 1);


//Vehicle Update

var vehicleupdatestorage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/vehicledetails');
    },
    filename : function(req,file,cb){
        var datetimestamp = Date.now();
        var userid = req.headers['id'];
        cb(null,userid + '-' +file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});

var vehicleupdateupload = multer({
    storage : vehicleupdatestorage
}).fields([{
    name : 'vehiclefront', maxCount : 1
},{
    name : 'vehicleback', maxCount : 1
},{
    name : 'vehicleside', maxCount : 1
},{
    name : 'vehicletitle', maxCount : 2
},{
    name : 'vehicleinsurance', maxCount : 2
}]);

module.exports = function(app){


//Retrieving the Driver Licence documents    

app.get('/driverdetails/:name',function(req,res,next){
    var options = {
        root : __dirname
    };

    var filename = req.params.name;
    res.sendFile(filename,options,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : filename + "has been sent"
            });
        }
    });
});

// //Retrieving the Updated Driver Details 

// app.get('/driverdetails/:name',function(req,res,next){
//     var options = {
//        // root : __dirname + /../ + /../ + 'public/driverupdate'
//           root : __dirname
//     };
//     var filename = req.params.name;
//     res.sendFile(filename,options,function(err){
//         if(err){
//             res.json({
//                 status : false,
//                 message : "Error Occured" + err
//             });
//         }else{
//             res.json({
//                 status : true,
//                 message : filename + "has been sent"
//             });
//         }
//     });
// });

//Retrieving the Updated Vehicle Details 

app.get('/vehicledetails/:name',function(req,res,next){
    var options = {
       // root : __dirname + /../ + /../ + 'public/driverupdate'
          root : __dirname
    };

    var filename = req.params.name;
    res.sendFile(filename,options,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : filename + "has been sent"
            });
        }
    });
});

// Driver Signup

app.post('/driversignup',function(req,res){
    var created = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss')
    var driversignup = {driver_name:req.headers['driver_name'],driver_mobile_pri:req.headers['driver_mobile_pri'],driver_email:req.headers['driver_email'],driver_mobile_sec:req.headers['driver_mobile_sec'],driver_experience:req.headers['driver_experience'],driver_licence_name:req.headers['driver_licence_name'],driver_licence_number:req.headers['driver_licence_number'],driver_licence_image:req.files,created_date:created,driver_operated_by:"movehaul",driver_verification:"pending",driver_status:"inactive",account_status:"inactive"};

    driverlicenceupload(req,res,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
                pool.getConnection(function(err,connection){
                if(err){
                res.json({
                    code : 100,
                    status : "Error in connecting Database"
                });
            }

            connection.query('INSERT INTO driver SET?',driversignup,function(err,user){
            if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                    });
            }else{

                connection.query('UPDATE driver SET driver_licence_image = ? WHERE driver_id = ?',[req.files[0].filename,user.insertId],function(err,save){
                    if(err){
                        res.json({
                            status : false,
                            message : "Error Occured" + err
                        });
                    }else{
                            res.json({
                    status : true,
                    message  : "You have been successfully Registered with MoveHaul.Wait for Admin to verify your licence Details"
                    });
                    }
                });



                 }
                });
                connection.release();
                });

        }
    });
});




//Trial Driver Mobile OTP

app.post('/drivermobileotp',function(req,res){
    var drivermobile = req.body.driver_mobile ;
    var otp = Math.floor(Math.random()*9000)+1000;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code :100,
                status : "Error in connecting Database"
            });
        }

        connection.query('SELECT * FROM driver WHERE driver_mobile_pri = ?',[drivermobile],function(err,mobile){
        if(err) throw err ;

        if(mobile == 0){
            res.json({
                status : false,
                message : "Register with MoveHaul first to Generate OTP"
            });
        }else if(mobile[0].driver_verification == "verified" && mobile[0].account_status != "blocked"){

            var driveremail = mobile[0].driver_email ;

        connection.query('SELECT * FROM driver WHERE driver_email = ?',[driveremail],function(err,email){
        if(err) throw err;

        if(email == 0){
            res.json({
                status : false,
                message : "Register with Movehaul first to Generate OTP"
            });
        }else{
                var username = email[0].driver_name ;
                var mailOptions = smtpTransport.templateSender({
                    subject : "OTP for MoveHaul APP",
                    html : "<b>Hello <strong>{{username}}</strong>,your One Time Password for MoveHaul App is <span style=color:blue>{{password}}</span></b>"
                },{
                    from : 'movehaul.developer@gmail.com'
                });

                mailOptions({
                    to : driveremail
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
                            connection.query('UPDATE driver SET driver_otp = ? WHERE driver_email = ?',[otp,driveremail],function(err,save){
                                if(err){
                                    res.json({
                                        status : false,
                                        message : "Error Occured" + err
                                    });
                                }else{
                                   

                                   connection.query('SELECT * FROM driver WHERE driver_mobile_pri = ?',[drivermobile],function(err,mobile){
        if(err) throw err ;

        if(mobile == 0){
                res.json({
                status : false,
                message : "Register with Movehaul first to Generate OTP"
            });      
        }else{
            client.messages.create({
                body : "Your MoveHaul OTP is" + " " + otp,
                to : drivermobile,
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


        }else{
            res.json({
                status : false,
                driver_verification : mobile[0].driver_verification,
                account_status : mobile[0].account_status 
            })
        }
        

        });


        connection.release();
    })
})



// //Driver Mobile OTP

// app.post('/drivermobileotp---',function(req,res){
//     var drivermobile = req.body.driver_mobile ;
//     var otp = Math.floor(Math.random()*9000)+1000;

//       pool.getConnection(function(err,connection){
//         if(err){
//             res.json({
//                 code : 100,
//                 status : "Error in connecting Database"
//             });
//         }

//         connection.query('SELECT * FROM driver WHERE driver_mobile_pri = ?',[drivermobile],function(err,mobile){
//         if(err) throw err ;

//         if(mobile == 0){
//                 res.json({
//                 status : false,
//                 message : "Register with Movehaul first to Generate OTP"
//             });      
//         }else{
//             client.messages.create({
//                 body : "Your MoveHaul OTP is" + " " + otp,
//                 to : drivermobile,
//                 from : '+12014740491'
//             },function(err,message){
//                 if(err){
//                     res.json({
//                         status : false,
//                         message : "Error Occured" + err
//                     });
//                 }else{
//                     connection.query('UPDATE driver SET driver_otp = ? WHERE driver_mobile_pri = ?',[otp,drivermobile],function(err,save){
//                         if(err){
//                             res.json({
//                                 status : false,
//                                 message : "Error Occured" + err
//                             });
//                         }else{
//                                 res.json({
//                                     status : true,
//                                     message : message.sid
//                     });

//                         }
//                     });
//                 }
//             });  
//         }
//     });
//     connection.release();
//     });
// });


//Driver Email OTP

app.post('/driveremailotp',function(req,res){
    var driveremail = req.body.driver_email;
    var otp = Math.floor(Math.random()*9000)+1000;

     pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code : 100,
                status : "Error in connecting Database"
            });
        }

 connection.query('SELECT * FROM driver WHERE driver_email = ?',[driveremail],function(err,email){
        if(err) throw err;

        if(email == 0){
            res.json({
                status : false,
                message : "Register with Movehaul first to Generate OTP"
            });
        }else if(email[0].driver_verification == "verified" && email[0].account_status != "blocked"){
                var username = email[0].driver_name ;
                var mailOptions = smtpTransport.templateSender({
                    subject : "OTP for MoveHaul APP",
                    html : "<b>Hello <strong>{{username}}</strong>,your One Time Password for MoveHaul App is <span style=color:blue>{{password}}</span></b>"
                },{
                    from : 'movehaul.developer@gmail.com'
                });

                mailOptions({
                    to : req.body.driver_email
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
                            connection.query('UPDATE driver SET driver_otp = ? WHERE driver_email = ?',[otp,driveremail],function(err,save){
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

            }else{
                res.json({
                    status : false,
                    driver_verification : email[0].driver_verification,
                    account_status : account_status
                });
            }
        });
        connection.release();
    });
});


var apiRoutes = express.Router();


//Driver Mobile login

apiRoutes.post('/mobilelogin',function(req,res){
        var drivermobile = req.body.driver_mobile;
        var driver_otp = req.body.driver_otp;

        pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code : 100,
                status : "Error in connecting Database"
            });
        }

         connection.query('SELECT * FROM driver WHERE driver_mobile_pri = ?',[drivermobile],function(err,mobile){
            if(err) throw err;

            if(mobile == 0){
                res.json({
                    status : false,
                    message : "Authentication failed.User not found"
                });
            }else if(mobile != 0){
                if(mobile[0].driver_otp != req.body.driver_otp){
                    res.json({
                        status : false,
                        message : "Authentication failed.Wrong Password"
                    });
                }else{

                    var token = jwt.sign(mobile[0].driver_mobile_pri,app.get('superSecret'));

                    var driver_id = mobile[0].driver_id ;
                    var driver_mobile = mobile[0].driver_mobile_pri;
                    var driver_email = mobile[0].driver_email;
                    var driver_name = mobile[0].driver_name;
                    var driver_image = mobile[0].driver_image;
                    var driver_licence_image = mobile[0].driver_licence_image;
                    var driver_verification = mobile[0].driver_verification;
                    var driver_status = mobile[0].driver_status;
                    var account_status = mobile[0].account_status;
            
            connection.query('SELECT * FROM truck WHERE driver_id = ?',[driver_id],function(err,truck){
                if(err) throw err;

                if(truck == 0){
                    
                            
                 res.json({
                        status : true,
                        message : "Logged in successfully",
                        driver_id : driver_id,
                        driver_mobile : driver_mobile,
                        driver_email : driver_email,
                        driver_name : driver_name,
                        driver_image : driver_image,
                        driver_licence_image : driver_licence_image,
                        driver_verification : driver_verification,
                        driver_status : driver_status,
                        account_status : account_status,
                        token : token
                    });

                }else if(truck != 0){
                 
                  
                    var truck_title_image1 = truck[0].truck_title_image ;
                    var truck_title_image2 = truck[1].truck_title_image ;
                    var truck_insurance_image1 = truck[0].truck_insurance_image ;
                    var truck_insurance_image2 = truck[1].truck_insurance_image ;
                    
                 res.json({
                        status : true,
                        message : "Logged in successfully",
                        driver_id : driver_id,
                        driver_mobile : driver_mobile,
                        driver_email : driver_email,
                        driver_name : driver_name,
                        driver_image : driver_image,
                        driver_licence_image : driver_licence_image,
                        driver_verification : driver_verification,
                        driver_status : driver_status,
                        account_status : account_status,
                        truck_title_image1 : truck_title_image1,
                        truck_title_image2 : truck_title_image2,
                        truck_insurance_image1 : truck_insurance_image1,
                        truck_insurance_image2 : truck_insurance_image2,
                        token : token
                    });

                    console.log(truck);
                }
            });
                }
            }
        });
        connection.release();
});
});



//Driver Email Login 

apiRoutes.post('/emaillogin',function(req,res){
        var driveremail = req.body.driver_email;
        var driver_otp = req.body.driver_otp;

        pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code : 100,
                status : "Error in connecting Database"
            });
        }

        connection.query('SELECT * FROM driver WHERE driver_email = ?',[driveremail],function(err,email){
            if(err) throw err;

            if(email == 0){
                res.json({
                    status : false,
                    message : "Authentication failed.User not found"
                });
            }else if(email != 0){
                if(email[0].driver_otp != req.body.driver_otp){
                    res.json({
                        status : false,
                        message : "Authentication failed.Wrong Password"
                    });
                }else{
                    var token = jwt.sign(email[0].driver_mobile,app.get('superSecret'));

                    var driver_id = email[0].driver_id ;
                    var driver_mobile = email[0].driver_mobile_pri;
                    var driver_email = email[0].driver_email;
                    var driver_name = email[0].driver_name;
                    var driver_image = email[0].driver_image;
                    var driver_licence_image = email[0].driver_licence_image;
                     var driver_verification = email[0].driver_verification;
                    var driver_status = email[0].driver_status;
                    var account_status = email[0].account_status;


                 connection.query('SELECT * FROM truck WHERE driver_id = ?',[driver_id],function(err,truck){
                if(err) throw err;

                if(truck == 0){
                    
                            
                 res.json({
                        status : true,
                        message : "Logged in successfully",
                        driver_id : driver_id,
                        driver_mobile : driver_mobile,
                        driver_email : driver_email,
                        driver_name : driver_name,
                        driver_image : driver_image,
                        driver_licence_image : driver_licence_image,
                        driver_verification : driver_verification,
                        driver_status : driver_status,
                        account_status : account_status,
                        token : token
                    });

                }else if(truck != 0){
                 
                  
                    var truck_title_image1 = truck[0].truck_title_image ;
                    var truck_title_image2 = truck[1].truck_title_image ;
                    var truck_insurance_image1 = truck[0].truck_insurance_image ;
                    var truck_insurance_image2 = truck[1].truck_insurance_image ;
                    
                 res.json({
                        status : true,
                        message : "Logged in successfully",
                        driver_id : driver_id,
                        driver_mobile : driver_mobile,
                        driver_email : driver_email,
                        driver_name : driver_name,
                        driver_image : driver_image,
                        driver_licence_image : driver_licence_image,
                        driver_verification : driver_verification,
                        driver_status : driver_status,
                        account_status : account_status,
                        truck_title_image1 : truck_title_image1,
                        truck_title_image2 : truck_title_image2,
                        truck_insurance_image1 : truck_insurance_image1,
                        truck_insurance_image2 : truck_insurance_image2,
                        token : token
                    });

                }


            });


                }
            }
        });
        connection.release();
    }); 
});





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


//Driver Profile Update

apiRoutes.post('/driverupdate',function(req,res){
    
    var driver_id = req.headers['id'];

    var drivertable = {driver_mobile_pri : req.headers['driver_mobile_pri'], driver_mobile_sec : req.headers['driver_mobile_sec'], driver_address : req.headers['driver_address'], driver_image : req.files}; 

    pool.getConnection(function(err,connection){
        if(err) throw err ;

    driverupdateupload(req,res,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{

            connection.query('SELECT * FROM driver WHERE driver_id = ?',[driver_id],function(err,driver){
                if(err){
                    res.json({
                        status : false,
                        message : "Error Occured" + err
                    });
                }else{


                             

//
                                if(req.files == undefined ){
//driverimage
                                function driverImage(){
                                    return driverimage = driver[0].driver_image ;   
                            }
                                var driverimage = driverImage()
                                }else if(req.files.length == 1){
                                    function driverImage(){
                                     if(typeof req.files[0].filename !== undefined){
                                    return driverimage = req.files[0].filename
                                }else{
                                    return driverimage = driver[0].driver_image ;
                                }
                                }
                                var driverimage = driverImage()
                                    console.log("No driver image has been attached");
                                }


            connection.query('UPDATE driver SET driver_mobile_pri = ?,driver_mobile_sec = ?,driver_address = ?,driver_image = ? WHERE driver_id = ?',[drivertable.driver_mobile_pri,drivertable.driver_mobile_sec,drivertable.driver_address,driverimage,driver_id],function(err,driver){
                if(err){
                    res.json({
                        status : false,
                        message : "Error Occured" + err
                    });
                }else{
                   res.json({
                                status : true,
                                driverimage : driverimage
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


//Driver vehicle Update

apiRoutes.post('/vehicleupdate',function(req,res){
   
    var driver_id = req.headers['id'];

    
                // var vehicletable = {truck_image_front : req.files.vehiclefront[0].filename,truck_image_back : req.files.vehicleback[0].filename, truck_image_side : req.files.vehicleside[0].filename,truck_title_image1 : req.files.vehicletitle[0].filename,truck_title_image2 : req.files.vehicletitle[1].filename,truck_insurance_image1 : req.files.vehicleinsurance[0].filename,truck_insurance_image2 : req.files.vehicleinsurance[1].filename}



    pool.getConnection(function(err,connection){
        if(err) throw err ;

        vehicleupdateupload(req,res,function(err){
            if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{


                connection.query('SELECT * FROM truck WHERE driver_id = ?',[driver_id],function(err,truck){

                   
                    if(err) throw err ;

                    if(truck == 0){    



//
                                if(req.files.vehiclefront.length == 1){
//vehiclefront
                                function vehicleFront(){
                                     if(typeof req.files.vehiclefront[0].filename !== undefined){
                                    return vehiclefront = req.files.vehiclefront[0].filename
                                }else{
                                    return vehiclefront = "null"
                                }
                                }
                                var vehiclefront = vehicleFront()
                                }else{
                                    console.log("No vehicle Front image has been attached");
                                }


//
                                if(req.files.vehicleback.length == 1){
//vehicleback
                                function vehicleBack(){
                                     if(typeof req.files.vehicleback[0].filename !== undefined){
                                    return vehicleback = req.files.vehicleback[0].filename
                                }else{
                                    return vehicleback = "null"
                                }
                                }
                                var vehicleback = vehicleBack()
                                }else{
                                    console.log("No vehicle Back image has been attached");
                                }


//
                                if(req.files.vehicleside.length == 1){
//vehicleside
                                function vehicleSide(){
                                     if(typeof req.files.vehicleside[0].filename !== undefined){
                                    return vehicleside = req.files.vehicleside[0].filename
                                }else{
                                    return vehicleside = "null"
                                }
                                }
                                var vehicleside = vehicleSide()
                                }else{
                                    console.log("No vehicle side image has been attached");
                                }

//vehicletitle      
                               if(req.files.vehicletitle.length == 1){
//vehicletitle1  
                                        function vehicleTitle1(){
                                        if(typeof req.files.vehicletitle[0].filename !== undefined){
                                        return vehicletitle1 = req.files.vehicletitle[0].filename
                                        }else{
                                        return vehicletitle1 = "null"
                                        }
                                        }
                                var vehicletitle1 = vehicleTitle1()
                                }else if(req.files.vehicletitle.length == 2){
//vehicletitle2 
                                        function vehicleTitle2(){      
                                        if(typeof req.files.vehicletitle[1].filename !== undefined){
                                        return vehicletitle2 = req.files.vehicletitle[1].filename
                                        }else{
                                        return vehicletitle2 = "null"
                                        }
                                        }
                                        var vehicletitle1 = vehicleTitle1()
                                        var vehicletitle2 = vehicleTitle2()
                                }else{
                                    console.log("No vehicle title image has been attached");
                                }
                              

//vehicleinsurance       
                               if(req.files.vehicleinsurance.length == 1){
//vehicleinsurance1  
                                        function vehicleInsurance1(){
                                        if(typeof req.files.vehicleinsurance[0].filename !== undefined){
                                        return vehicleinsurance1 = req.files.vehicleinsurance[0].filename
                                        }else{
                                        return vehicleinsurance1 = "null"
                                        }
                                        }
                                var vehicleinsurance1 = vehicleInsurance1()
                                }else if(req.files.vehicleinsurance.length == 2){
//vehicleinsurance2 
                                        function vehicleInsurance2(){      
                                        if(typeof req.files.vehicleinsurance[1].filename !== undefined){
                                        return vehicleinsurance2 = req.files.vehicleinsurance[1].filename
                                        }else{
                                        return vehicleinsurance2 = "null"
                                        }
                                        }
                                        var vehicleinsurance1 = vehicleInsurance1()
                                        var vehicleinsurance2 = vehicleInsurance2()
                                }else{
                                    console.log("No vehicle insurance image has been attached");
                                }
                               

                        connection.query('INSERT INTO truck SET truck_image_front = ?,truck_image_back = ?,truck_image_side = ?,truck_title_image1 = ?,truck_title_image2 = ?,truck_insurance_image1 = ?,truck_insurance_image2 = ?,driver_id = ?',[vehiclefront,vehicleback,vehicleside,vehicletitle1,vehicletitle2,vehicleinsurance1,vehicleinsurance2,driver_id],function(err,save){
                           

                            if(err){
                                res.json({
                                    status : false,
                                    message : "Error Occured" + err
                                });
                            }else{
                                res.json({
                                    status : true,
                                    vehiclefront : vehiclefront,
                                    vehicleback : vehicleback,
                                    vehicleside : vehicleside,
                                    vehicletitle1 : vehicletitle1,
                                    vehicletitle2 : vehicletitle2,
                                    vehicleinsurance1 : vehicleinsurance1,
                                    vehicleinsurance2 : vehicleinsurance2
                                });
                            } 
                        });
                               

                    }else if(truck !=0 ){


//
                                if(req.files.vehiclefront == undefined){
//vehiclefront
                                    function vehicleFront(){
                                        return vehiclefront == truck[0].truck_image_front ;
                                    }
                                    var vehiclefront = vehicleFront()
                                }else if(req.files.vehiclefront.length == 1){
                                function vehicleFront(){
                                     if(typeof req.files.vehiclefront[0].filename !== undefined){
                                    return vehiclefront = req.files.vehiclefront[0].filename
                                }else{
                                    return vehiclefront = truck[0].truck_image_front
                                }
                                }
                                var vehiclefront = vehicleFront()
                                }else{
                                    console.log("No vehicle Front image has been attached");
                                }


//
                                if(req.files.vehicleback == undefined){
//vehicleback
                                    function vehicleBack(){
                                        return vehicleback == truck[0].truck_image_back ;
                                    }
                                    var vehicleback = vehicleBack()
                                }else if(req.files.vehicleback.length == 1){
                                function vehicleBack(){
                                     if(typeof req.files.vehicleback[0].filename !== undefined){
                                    return vehicleback = req.files.vehicleback[0].filename
                                }else{
                                    return vehicleback = truck[0].truck_image_back
                                }
                                }
                                var vehicleback = vehicleBack()
                                }else{
                                    console.log("No vehicle Back image has been attached");
                                }


//
                                if(req.files.vehicleside == undefined){
//vehicleside
                                    function vehicleSide(){
                                        return vehicleside == truck[0].truck_image_side ;
                                    }
                                    var vehicleside = vehicleSide()
                                }else if(req.files.vehicleside.length == 1){
                                function vehicleSide(){
                                     if(typeof req.files.vehicleside[0].filename !== undefined){
                                    return vehicleside = req.files.vehicleside[0].filename
                                }else{
                                    return vehicleside = truck[0].truck_image_side
                                }
                                }
                                var vehicleside = vehicleSide()
                                }else{
                                    console.log("No vehicle side image has been attached");
                                }




//vehicletitle 
                                if(req.files.vehicletitle == undefined){
                                    function vehicleTitle1(){
                                        return vehicletitle1 == truck[0].truck_title_image1 ;
                                    }
                                    function vehicleTitle2(){
                                        return vehicletitle2 == truck[0].truck_title_image2 ;
                                    }
                                        var vehicletitle1 = vehicleTitle1()
                                        var vehicletitle2 = vehicleTitle2()
                                }else if(req.files.vehicletitle.length == 1){
//vehicletitle1  
                                        function vehicleTitle1(){
                                        if(typeof req.files.vehicletitle[0].filename !== undefined){
                                        return vehicletitle1 = req.files.vehicletitle[0].filename
                                        }else{
                                        return vehicletitle1 = truck[0].truck_title_image1
                                        }
                                        }
                                var vehicletitle1 = vehicleTitle1()
                                }else if(req.files.vehicletitle.length == 2){
//vehicletitle2
                                        function vehicleTitle1(){
                                        if(typeof req.files.vehicletitle[0].filename !== undefined){
                                        return vehicletitle1 = req.files.vehicletitle[0].filename
                                        }else{
                                        return vehicletitle1 = truck[0].truck_title_image1
                                        }
                                        }
//vehicletitle2 
                                        function vehicleTitle2(){      
                                        if(typeof req.files.vehicletitle[1].filename !== undefined){
                                        return vehicletitle2 = req.files.vehicletitle[1].filename
                                        }else{
                                        return vehicletitle2 = truck[0].truck_title_image2
                                        }
                                        }
                                        var vehicletitle1 = vehicleTitle1()
                                        var vehicletitle2 = vehicleTitle2()
                                }else{
                                    console.log("No vehicle title image has been attached");
                                }
                   



//vehicleinsurance 
                                if(req.files.vehicleinsurance == undefined){
                                    function vehicleInsurance1(){
                                        return vehicleinsurance1 == truck[0].truck_insurance_image1 ;
                                    }
                                    function vehicleInsurance2(){
                                        return vehicleinsurance2 == truck[0].truck_insurance_image2 ;
                                    }
                                        var vehicleinsurance1 = vehicleInsurance1()
                                        var vehicleinsurance2 = vehicleInsurance2()

                                }else if(req.files.vehicleinsurance.length == 1){
//vehicleinsurance1  
                                        function vehicleInsurance1(){
                                        if(typeof req.files.vehicleinsurance[0].filename !== undefined){
                                        return vehicleinsurance1 = req.files.vehicleinsurance[0].filename
                                        }else{
                                        return vehicleinsurance1 = truck[0].truck_insurance_image1
                                        }
                                        }
                                var vehicleinsurance1 = vehicleInsurance1()
                                }else if(req.files.vehicleinsurance.length == 2){
//vehicleinsurance2
                                        function vehicleInsurance1(){
                                        if(typeof req.files.vehicleinsurance[0].filename !== undefined){
                                        return vehicleinsurance1 = req.files.vehicleinsurance[0].filename
                                        }else{
                                        return vehicleinsurance1 = truck[0].truck_insurance_image1
                                        }
                                        }
//vehicleinsurance2 
                                        function vehicleInsurance2(){      
                                        if(typeof req.files.vehicleinsurance[1].filename !== undefined){
                                        return vehicleinsurance2 = req.files.vehicleinsurance[1].filename
                                        }else{
                                        return vehicleinsurance2 = truck[0].truck_insurance_image2
                                        }
                                        }
                                        var vehicleinsurance1 = vehicleInsurance1()
                                        var vehicleinsurance2 = vehicleInsurance2()
                                }else{
                                    console.log("No vehicle insurance image has been attached");
                                }
                                 

                    connection.query('UPDATE truck SET truck_image_front = ?,truck_image_back = ?,truck_image_side = ?,truck_title_image1 = ?,truck_title_image2 = ?,truck_insurance_image1 = ?,truck_insurance_image2 = ? WHERE driver_id',[vehiclefront,vehicleback,vehicleside,vehicletitle1,vehicletitle2,vehicleinsurance1,vehicleinsurance2,driver_id],function(err,save){
                            if (err){
                                res.json({
                                    status : false,
                                    message : "Error Occured" + err
                                });
                            }else{
                                res.json({
                                    status : true,
                                    vehiclefront : vehiclefront,
                                    vehicleback : vehicleback,
                                    vehicleside : vehicleside,
                                    vehicletitle1 : vehicletitle1,
                                    vehicletitle2 : vehicletitle2,
                                    vehicleinsurance1 : vehicleinsurance1,
                                    vehicleinsurance2 : vehicleinsurance2
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




/*

//Driver vehicle Update

apiRoutes.post('/vehicleupdate',function(req,res){
   
    var driver_id = req.headers['id'];

    var vehicletable = {truck_image_front : req.files,truck_image_back : req.files, truck_image_side : req.files,truck_title_image : req.files,truck_insurance_image : req.files}

    pool.getConnection(function(err,connection){
        if(err) throw err ;

        vehicleupdateupload(req,res,function(err){
            if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{
                connection.query('SELECT * FROM truck WHERE driver_id = ?',[driver_id],function(err,truck){
                    if(err) throw err ;

                    if(truck == 0){
                        connection.query('INSERT INTO truck SET truck_image_front = ?,truck_image_back = ?,truck_image_side = ?,truck_title_image1 = ?,truck_title_image2 = ?,truck_insurance_image1 = ?,truck_insurance_image2 = ?,driver_id = ?',[req.files.vehiclefront[0].filename,req.files.vehicleback[0].filename,req.files.vehicleside[0].filename,req.files.vehicletitle[0].filename,req.files.vehicletitle[1].filename,req.files.vehicleinsurance[0].filename,req.files.vehicleinsurance[1].filename,driver_id],function(err,save){
                            if(err){
                                res.json({
                                    status : false,
                                    message : "Error Occured" + err
                                });
                            }else{
                                res.json({
                                    status : true,
                                    vehiclefront : req.files.vehiclefront[0].filename,
                                    vehicleback : req.files.vehicleback[0].filename,
                                    vehicleside : req.files.vehicleside[0].filename,
                                    vehicletitle1 : req.files.vehicletitle[0].filename,
                                    vehicletitle2 : req.files.vehicletitle[1].filename,
                                    vehicleinsurance1 : req.files.vehicleinsurance[0].filename,
                                    vehicleinsurance2 : req.files.vehicleinsurance[1].filename
                                });
                            }
                        });
                    }else if(truck !=0 ){
                        connection.query('UPDATE truck SET truck_image_front = ?,truck_image_back = ?,truck_image_side = ?,truck_title_image1 = ?,truck_title_image2 = ?,truck_insurance_image1 = ?,truck_insurance_image2 = ?',[req.files.vehiclefront[0].filename,req.files.vehicleback[0].filename,req.files.vehicleside[0].filename,req.files.vehicletitle[0].filename,req.files.vehicletitle[1].filename,req.files.vehicleinsurance[0].filename,req.files.vehicleinsurance[1].filename],function(err,save){
                            if (err){
                                res.json({
                                    status : false,
                                    message : "Error Occured" + err
                                });
                            }else{
                                res.json({
                                    status : true,
                                    vehiclefront : req.files.vehiclefront[0].filename,
                                    vehicleback : req.files.vehicleback[0].filename,
                                    vehicleside : req.files.vehicleside[0].filename,
                                    vehicletitle1 : req.files.vehicletitle[0].filename,
                                    vehicletitle2 : req.files.vehicletitle[1].filename,
                                    vehicleinsurance1 : req.files.vehicleinsurance[0].filename,
                                    vehicleinsurance2 : req.files.vehicleinsurance[1].filename
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




//Driver Vehicle Update

apiRoutes.post('/vehicleupdate',function(req,res){
    var userid = req.headers['id'];

     var drivertable = {driver_mobile_pri : req.headers['driver_mobile_pri'],driver_mobile_sec : req.headers['driver_mobile_sec'],driver_address : req.headers['driver_address'], driver_image : req.files};

    var trucktable = {truck_image_front : req.files,truck_image_back : req.files, truck_image_side : req.files,truck_title_image : req.files,truck_insurance_image : req.files}

      
      var truck_image_front = {truck_image_front : req.files} ; 

      var driver_id = {driver_id : userid};

       pool.getConnection(function(err,connection){
          if(err){
             throw err;
          }

          driverupdateupload(req,res,function(err){
              if(err){
                  res.json({
                      status : false,
                      message : "Error Occured" + err
                  })
              }else{
                  connection.query('UPDATE driver SET driver_mobile_pri = ?,driver_mobile_sec = ?,driver_address = ? WHERE driver_id = ?',[drivertable.driver_mobile_pri,drivertable.driver_mobile_sec,drivertable.driver_address,userid],function(err,user){
                      if(err){
                          res.json({
                              status : false,
                              message : "Error Occured" + err
                          })
                      }else{
                     connection.query('UPDATE driver SET driver_image = ? WHERE driver_id = ?',[req.files.driverimage[0].filename,userid],function(err,save){
                         if(err){
                             res.json({
                                 status : false,
                                 message : "Error Occured" + err
                             });
                         }else{

//Looping Starts

                            connection.query('SELECT * FROM truck WHERE driver_id = ?',[userid],function(err,user){
                                if(err) throw err;

                                if(user == 0){

                                    connection.query('INSERT INTO truck SET truck_image_front = ?,truck_image_back = ?,truck_image_side = ?,driver_id = ?',[req.files.vehiclefront[0].filename,req.files.vehicleback[0].filename,req.files.vehicleside[0].filename,userid],function(err,save){
                                 if(err){
                                     res.json({
                                         status : false,
                                         message : "Error Occured" + err
                                     });
                                 }else{
                                    
                                     connection.query('SELECT * FROM truck_title_image WHERE driver_id = ?',[userid],function(err,title){
                            
    if(err) throw err;

    if(title == 0){
       for(var i=0;i<req.files.vehicletitle.length;i++){
       var vehicletitle = req.files.vehicletitle[i].filename
    

        connection.query('INSERT INTO truck_title_image SET truck_title_image = ?,driver_id = ?',[vehicletitle,userid],function(err,save){
            if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{

                    connection.query('SELECT * FROM truck_insurance_image WHERE driver_id = ?',[userid],function(err,title){

    if(err) throw err;

    if(title == 0){

        for(var i=0;i<req.files.vehicleinsurance.length;i++){ 
            var vehicleinsurance = req.files.vehicleinsurance[i].filename
        
        
        connection.query('INSERT INTO truck_insurance_image SET truck_insurance_image = ?,driver_id = ?',[vehicleinsurance,userid],function(err,save){
            if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{
                res.json({
                    status : true
                });
            }
        }); } //for insurance
    }else if(title !=0 ){

         for(var i=0;i<req.files.vehicleinsurance.length;i++){
            var vehicleinsurance = req.files.vehicleinsurance[i].filename            

        connection.query('UPDATE truck_insurance_image SET truck_insurance_image = ? WHERE driver_id = ?',[vehicleinsurance,userid],function(err,save){
                 if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{
                res.json({
                    status : true
                });
            }
        });
    } } // for inurance
});           
            }
        }); } //for title
    }else if(title !=0 ){
        for(var i=0;i<req.files.vehicletitle.length;i++){
       var vehicletitle = req.files.vehicletitle[i].filename
    
        connection.query('UPDATE truck_title_image SET truck_title_image = ? WHERE driver_id = ?',[vehicletitle,userid],function(err,save){
                 if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{
               
                connection.query('SELECT * FROM truck_insurance_image WHERE driver_id = ?',[userid],function(err,title){

    if(err) throw err;

    if(title == 0){

        for(var i=0;i<req.files.vehicleinsurance.length;i++){ 
            var vehicleinsurance = req.files.vehicleinsurance[i].filename
        
        
        connection.query('INSERT INTO truck_insurance_image SET truck_insurance_image = ?,driver_id = ?',[vehicleinsurance,userid],function(err,save){
            if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{
                res.json({
                    status : true
                });
            }
        }); } //for inurance
    }else if(title !=0 ){

         for(var i=0;i<req.files.vehicleinsurance.length;i++){
            var vehicleinsurance = req.files.vehicleinsurance[i].filename            

        connection.query('UPDATE truck_insurance_image SET truck_insurance_image = ? WHERE driver_id = ?',[vehicleinsurance,userid],function(err,save){
                 if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{
                res.json({
                    status : true
                });
            }
        });
    } } // for insurance
});

            }
        });
    } } // for title
});

                                 }
                             });

                                }else if(user != 0){

                                    connection.query('UPDATE truck SET truck_image_front = ?,truck_image_back = ?,truck_image_side = ? WHERE driver_id = ?',[req.files.vehiclefront[0].filename,req.files.vehicleback[0].filename,req.files.vehicleside[0].filename,userid],function(err,save){
                                        if(err){
                                            res.json({
                                                status : false,
                                                message : "Error Occured" + err
                                            });
                                        }else{

connection.query('SELECT * FROM truck_title_image WHERE driver_id = ?',[userid],function(err,title){

    if(err) throw err;

    if(title == 0){
        
            for(var i=0;i<req.files.vehicletitle.length;i++){
       var vehicletitle = req.files.vehicletitle[i].filename
    

        connection.query('INSERT INTO truck_title_image SET truck_title_image = ?,driver_id = ?',[vehicletitle,userid],function(err,save){
            if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{
               
                connection.query('SELECT * FROM truck_insurance_image WHERE driver_id = ?',[userid],function(err,title){

    if(err) throw err;

    if(title == 0){

        for(var i=0;i<req.files.vehicleinsurance.length;i++){ 
            var vehicleinsurance = req.files.vehicleinsurance[i].filename
        
        
        connection.query('INSERT INTO truck_insurance_image SET truck_insurance_image = ?,driver_id = ?',[vehicleinsurance,userid],function(err,save){
            if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{
                res.json({
                    status : true
                });
            }
        }); } //for insurance
    }else if(title !=0 ){

         for(var i=0;i<req.files.vehicleinsurance.length;i++){
            var vehicleinsurance = req.files.vehicleinsurance[i].filename            

        connection.query('UPDATE truck_insurance_image SET truck_insurance_image = ? WHERE driver_id = ?',[vehicleinsurance,userid],function(err,save){
                 if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{
                res.json({
                    status : true
                });
            }
        });
    } } // for insurance
});

            }
        }); } //for truck
    }else if(title !=0 ){

            for(var i=0;i<req.files.vehicletitle.length;i++){
       var vehicletitle = req.files.vehicletitle[i].filename
    
        connection.query('UPDATE truck_title_image SET truck_title_image = ? WHERE driver_id = ?',[vehicletitle,userid],function(err,save){
                 if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{
                
                    connection.query('SELECT * FROM truck_insurance_image WHERE driver_id = ?',[userid],function(err,title){

    if(err) throw err;

    if(title == 0){

        for(var i=0;i<req.files.vehicleinsurance.length;i++){ 
            var vehicleinsurance = req.files.vehicleinsurance[i].filename
        
        
        connection.query('INSERT INTO truck_insurance_image SET truck_insurance_image = ?,driver_id = ?',[vehicleinsurance,userid],function(err,save){
            if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{
                res.json({
                    status : true
                });
            }
        }); } //for insurance
    }else if(title !=0 ){

         for(var i=0;i<req.files.vehicleinsurance.length;i++){
            var vehicleinsurance = req.files.vehicleinsurance[i].filename            

        connection.query('UPDATE truck_insurance_image SET truck_insurance_image = ? WHERE driver_id = ?',[vehicleinsurance,userid],function(err,save){
                 if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{
                res.json({
                    status : true
                });
            }
        });
    } } // for insurance
});

            }
        });
    } } // for truck
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
       });
       
});

*/

// Driver Location Update

apiRoutes.post('/location',function(req,res){

    var driverid = req.headers['id'];

    var driverstatus = req.body.driver_status ; 

    var location = {latitude : req.body.driver_latitude,longitude : req.body.driver_longitude, locality1 : req.body.driver_locality1, locality2 : req.body.driver_locality2};

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code : 100,
                status : "Error in connecting Database"
            });
        }

    connection.query('UPDATE driver SET driver_status = ? WHERE driver_id = ?',[driverstatus,driverid],function(err,info){
       if(err){
            res.json({
               status : false,
        });
     }   else{

                connection.query('SELECT * FROM driver_location WHERE driver_id = ?',[driverid],function(err,driver){
        if(err) throw err;

        if(driver == 0){

            connection.query('INSERT INTO driver_location SET driver_latitude = ?,driver_longitude = ?,driver_locality1 = ?,driver_locality2 = ?,driver_id = ?',[location.latitude,location.longitude,location.locality1,location.locality2,driverid],function(err,save){
                if(err){
                    res.json({
                        status : false,
                        message : "Error Occured" + err
                    });
                }else{
                    res.json({
                        status : true,
                        message : "Location Updated successfully"
                    });
                }
            });
        }else if(driver != 0 ){
            
            connection.query('UPDATE driver_location SET driver_latitude = ?,driver_longitude = ?,driver_locality1 = ?,driver_locality2 = ? WHERE driver_id = ?',[location.latitude,location.longitude,location.locality1,location.locality2,driverid],function(err,save){
                if(err){
                    res.json({
                        status : false,
                        message : "Error Occured" + err
                    });
                }else{
                    res.json({
                        status : true,
                        message : "Location Updated successfully"
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










app.use('/driver',apiRoutes);


}








