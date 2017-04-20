var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var moment = require('moment');
var multer = require('multer');
var mime = require('mime');
var nodemailer = require('nodemailer');
var easyid = require('easyid');

var verifier = require('email-verify');

var pool = require('../connection');


//Twilio Configuration

var twilio = require('twilio');

var accountSid = 'AC78e3aefc278a8184d567d7041b97bb20';
var authToken = 'aa199ed7aa3914d3fe9e3583ad8a6f20';

var client = twilio(accountSid,authToken);

//Nodemailer Configuration

var smtpTransport = nodemailer.createTransport('smtps://movehaul.developer%40gmail.com:Noble_1234@smtp.gmail.com');


//Driver Licence Image

var driverlicencestorage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'C:/wamp64/www/movehaul/assets/img/driver_details');
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
        cb(null,'C:/wamp64/www/movehaul/assets/img/driver_details');
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
        cb(null,'C:/wamp64/www/movehaul/assets/img/vehicle_details');
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

app.get('/driver_details/:name',function(req,res,next){
    var options = {
        //root : __dirname
        root : 'C:/wamp64/www/movehaul/assets/img/driver_details'
    };

    var filename = req.params.name;
    res.sendFile(filename,options,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }
        else{
           console.log(filename +" has been sent")
        }
    });
});


//Retrieving the Updated Vehicle Details 

app.get('/vehicle_details/:name',function(req,res,next){
    var options = {
       // root : __dirname + /../ + /../ + 'public/driverupdate'
       // root : __dirname
    root : 'C:/wamp64/www/movehaul/assets/img/vehicle_details'
    };

    var filename = req.params.name;
    res.sendFile(filename,options,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }
        else{
          console.log(filename +" has been sent")
        }
    });
});





// Driver Signup

app.post('/driversignup',function(req,res){

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

    var fake_id = "MOVD" + num2 + char2 + num1 ;

    var driversignup = {driver_name:req.headers['driver_name'],driver_mobile_pri:req.headers['driver_mobile_pri'],driver_email:req.headers['driver_email'],driver_mobile_sec:req.headers['driver_mobile_sec'],driver_experience:req.headers['driver_experience'],driver_licence_name:req.headers['driver_licence_name'],driver_licence_number:req.headers['driver_licence_number'],driver_licence_image:req.files,created_date:created,driver_job_status:"free",driver_operated_by:"movehaul",driver_verification:"pending",driver_status:"inactive",account_status:"inactive",fake_id : fake_id,fcm_id:req.headers['fcm_id'],vehicle_type: req.headers['vehicle_type']};

    

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





//Bus Driver Mobile OTP

app.post('/drivermobileotp',function(req,res){
    var drivermobile = req.body.driver_mobile ;
    var otp = Math.floor(Math.random()*9000)+1000;

    var fcm_id = req.body.fcm_id ;

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
                    var vehicle_type = mobile[0].vehicle_type
                    res.json({
                        status : false,
                        message : "Error Occured" + err,
                        vehicle_type : vehicle_type
                    });
                }
                      else{
                                 var vehicle_type = mobile[0].vehicle_type

                                res.json({
                                    status : true,
                                    message : message.sid,
                                    vehicle_type : vehicle_type
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
                message: {
                driver_verification : mobile[0].driver_verification,
                account_status : mobile[0].account_status 
                }
            })
        }
        

        });


        connection.release();
    })
})



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
                                     var vehicle_type = email[0].vehicle_type;

                                    res.json({
                                        status : true,
                                        vehicle_type : vehicle_type,
                                        message : "OTP has been sent to your Email"
                                    });
                                }
                            });
                        }
                });

            }else{
                res.json({
                    status : false,
                    message: "Wait for Admin Verification",
                    driver_verification : mobile[0].driver_verification,
                    account_status : mobile[0].account_status 
                });
            }
        });
        connection.release();
    });
});





var busRoutes = express.Router();


//Driver Mobile login

busRoutes.post('/mobilelogin',function(req,res){
        var drivermobile = req.body.driver_mobile;
        var driver_otp = req.body.driver_otp;
        var fcm_id = req.body.fcm_id;

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
                    var fake_id = mobile[0].fake_id ;
                    var driver_mobile = mobile[0].driver_mobile_pri;
                    var driver_mobile_sec = mobile[0].driver_mobile_sec;
                    var driver_address = mobile[0].driver_address;
                    var driver_email = mobile[0].driver_email;
                    var driver_name = mobile[0].driver_name;
                    var driver_image = mobile[0].driver_image;
                    var driver_licence_image = mobile[0].driver_licence_image;
                    var driver_verification = mobile[0].driver_verification;
                    var driver_status = mobile[0].driver_status;
                    var account_status = mobile[0].account_status;
                    var vehicle_type = mobile[0].vehicle_type;
            
            connection.query('SELECT * FROM bus WHERE driver_id = ?',[driver_id],function(err,bus){
                if(err) throw err;

                if(bus == 0){
                    
                        connection.query('UPDATE driver SET fcm_id = ? WHERE driver_id = ?',[fcm_id,driver_id],function(err,save){
                            if(err){
                                res.json({
                                    status: false,
                                    message: "Error Occured " + err
                                });
                            }else{
                                               
                                       res.json({
                                              status : true,
                                              message : "Logged in successfully",
                                              driver_id : driver_id,
                                              fake_id : fake_id,
                                              driver_mobile : driver_mobile,
                                              driver_mobile_sec : driver_mobile_sec,
                                              driver_email : driver_email,
                                              driver_name : driver_name,
                                              driver_image : driver_image,
                                              driver_licence_image : driver_licence_image,
                                              driver_verification : driver_verification,
                                              driver_status : driver_status,
                                              account_status : account_status,
                                              vehicle_type : vehicle_type,
                                              token : token
                                          });
                                
                            }
                        })
            
                 

                }else if(bus != 0){
                 
                    var bus_image_front = bus[0].bus_image_front;
                    var bus_image_back = bus[0].bus_image_back;
                    var bus_image_side = bus[0].bus_image_side;
                    var bus_title_image1 = bus[0].bus_title_image1 ;
                    var bus_title_image2 = bus[0].bus_title_image2 ;
                    var bus_insurance_image1 = bus[0].bus_insurance_image1 ;
                    var bus_insurance_image2 = bus[0].bus_insurance_image2 ;
                    var bus_verification = bus[0].bus_verification ; 



                    
                        connection.query('UPDATE driver SET fcm_id = ? WHERE driver_id = ?',[fcm_id,driver_id],function(err,save){
                            if(err){
                                res.json({
                                    status: false,
                                    message: "Error Occured " + err
                                });
                            }else{

                                        
                                        res.json({
                                               status : true,
                                               message : "Logged in successfully",
                                               driver_id : driver_id,
                                               fake_id : fake_id,
                                               driver_mobile : driver_mobile,
                                               driver_mobile_sec : driver_mobile_sec,
                                               driver_address : driver_address,
                                               driver_email : driver_email,
                                               driver_name : driver_name,
                                               driver_image : driver_image,
                                               driver_licence_image : driver_licence_image,
                                               driver_verification : driver_verification,
                                               driver_status : driver_status,
                                               account_status : account_status,
                                               vehicle_type : vehicle_type,
                                               bus_image_front : bus_image_front,
                                               bus_image_back : bus_image_back,
                                               bus_image_side : bus_image_side,
                                               bus_title_image1 : bus_title_image1,
                                               bus_title_image2 : bus_title_image2,
                                               bus_insurance_image1 : bus_insurance_image1,
                                               bus_insurance_image2 : bus_insurance_image2,
                                               bus_verification : bus_verification,
                                               token : token
                                           });

                            }
                        })

                }
            });
                }
            }
        });
        connection.release();
});
});




//Driver Email Login 

busRoutes.post('/emaillogin',function(req,res){
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
                    var fake_id = email[0].fake_id ;
                    var driver_mobile = email[0].driver_mobile_pri;
                    var driver_mobile_sec = email[0].driver_mobile_sec;
                    var driver_address = email[0].driver_address;
                    var driver_email = email[0].driver_email;
                    var driver_name = email[0].driver_name;
                    var driver_image = email[0].driver_image;
                    var driver_licence_image = email[0].driver_licence_image;
                    var driver_verification = email[0].driver_verification;
                    var driver_status = email[0].driver_status;
                    var account_status = email[0].account_status;
                    var vehicle_type = email[0].vehicle_type;

                 connection.query('SELECT * FROM bus WHERE driver_id = ?',[driver_id],function(err,bus){
                if(err) throw err;

                if(bus == 0){


                         connection.query('UPDATE driver SET fcm_id = ? WHERE driver_id = ?',[fcm_id,driver_id],function(err,save){
                            if(err){
                                res.json({
                                    status: false,
                                    message: "Error Occured " + err
                                });
                            }else{

                                     res.json({
                                            status : true,
                                            message : "Logged in successfully",
                                            driver_id : driver_id,
                                            driver_mobile : driver_mobile,
                                            driver_mobile_sec : driver_mobile_sec,
                                            driver_address : driver_address,
                                            driver_email : driver_email,
                                            driver_name : driver_name,
                                            driver_image : driver_image,
                                            driver_licence_image : driver_licence_image,
                                            driver_verification : driver_verification,
                                            driver_status : driver_status,
                                            account_status : account_status,
                                            vehicle_type : vehicle_type,
                                            token : token
                                        });

                            }

                         });

                }else if(bus != 0){
                 
                  
                    var bus_image_front = bus[0].bus_image_front;
                    var bus_image_back = bus[0].bus_image_back;
                    var bus_image_side = bus[0].bus_image_side;
                    var bus_title_image1 = bus[0].bus_title_image1 ;
                    var bus_title_image2 = bus[0].bus_title_image2 ;
                    var bus_insurance_image1 = bus[0].bus_insurance_image1 ;
                    var bus_insurance_image2 = bus[0].bus_insurance_image2 ;
                    var bus_verification = bus[0].bus_verification ; 



                    
                    connection.query('UPDATE driver SET fcm_id = ? WHERE driver_id = ?',[fcm_id,driver_id],function(err,save){
                            if(err){
                                res.json({
                                    status: false,
                                    message: "Error Occured " + err
                                });
                            }else{


                                    res.json({
                                           status : true,
                                           message : "Logged in successfully",
                                           driver_id : driver_id,
                                           driver_mobile : driver_mobile,
                                           driver_mobile_sec : driver_mobile_sec,
                                           driver_address : driver_address,
                                           driver_email : driver_email,
                                           driver_name : driver_name,
                                           driver_image : driver_image,
                                           driver_licence_image : driver_licence_image,
                                           driver_verification : driver_verification,
                                           driver_status : driver_status,
                                           account_status : account_status,
                                           vehicle_type : vehicle_type,
                                           bus_title_image1 : bus_title_image1,
                                           bus_title_image2 : bus_title_image2,
                                           bus_insurance_image1 : bus_insurance_image1,
                                           bus_insurance_image2 : bus_insurance_image2,
                                           bus_verification : bus_verification,
                                           token : token
                                       });

                            }

                         })
                
                }


            });


                }
            }
        });
        connection.release();
    }); 
});





busRoutes.use(function(req,res,next){
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

busRoutes.post('/driverupdate',function(req,res){
    
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


            connection.query('UPDATE driver SET driver_mobile_pri = ?,driver_mobile_sec = ?,driver_address = ?,driver_image = ? WHERE driver_id = ?',[drivertable.driver_mobile_pri,drivertable.driver_mobile_sec,drivertable.driver_address,driverimage,driver_id],function(err,save){
                if(err){
                    res.json({
                        status : false,
                        message : "Error Occured" + err
                    });
                }else{
                   res.json({
                                status : true,
                                driverimage : driverimage,
                                driver_mobile_pri : drivertable.driver_mobile_pri,
                                driver_mobile_sec : drivertable.driver_mobile_sec,
                                driver_address : drivertable.driver_address
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

busRoutes.post('/vehicleupdate',function(req,res){
   
    var driver_id = req.headers['id'];

    
                // var vehicletable = {bus_image_front : req.files.vehiclefront[0].filename,bus_image_back : req.files.vehicleback[0].filename, bus_image_side : req.files.vehicleside[0].filename,bus_title_image1 : req.files.vehicletitle[0].filename,bus_title_image2 : req.files.vehicletitle[1].filename,bus_insurance_image1 : req.files.vehicleinsurance[0].filename,bus_insurance_image2 : req.files.vehicleinsurance[1].filename}



    pool.getConnection(function(err,connection){
        if(err) throw err ;

        vehicleupdateupload(req,res,function(err){
            if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{


                connection.query('SELECT * FROM bus WHERE driver_id = ?',[driver_id],function(err,bus){

                   
                    if(err) throw err ;

                    if(bus == 0){    



                             
//
                                if(req.files.vehiclefront == undefined){
//vehiclefront
                                    function vehicleFront(){
                                        return vehiclefront = "null" ;
                                    }
                                    var vehiclefront = vehicleFront()
                                }else if(req.files.vehiclefront.length == 1){
                                function vehicleFront(){
                                     if(typeof req.files.vehiclefront[0].filename !== undefined){
                                    return vehiclefront = req.files.vehiclefront[0].filename
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
                                        return vehicleback = "null" ;
                                    }
                                    var vehicleback = vehicleBack()
                                }else if(req.files.vehicleback.length == 1){
                                function vehicleBack(){
                                     if(typeof req.files.vehicleback[0].filename !== undefined){
                                    return vehicleback = req.files.vehicleback[0].filename
                                }
                                }
                                var vehicleback = vehicleBack()
                                }else{
                                    console.log("No vehicle back image has been attached");
                                }


                            
//
                                if(req.files.vehicleside == undefined){
//vehicleside
                                    function vehicleSide(){
                                        return vehicleside = "null" ;
                                    }
                                    var vehicleside = vehicleSide()
                                }else if(req.files.vehicleside.length == 1){
                                function vehicleSide(){
                                     if(typeof req.files.vehicleside[0].filename !== undefined){
                                    return vehicleside = req.files.vehicleside[0].filename
                                }
                                }
                                var vehicleside = vehicleSide()
                                }else{
                                    console.log("No vehicle side image has been attached");
                                }



//vehicletitle 
                                if(req.files.vehicletitle == undefined){
                                    function vehicleTitle1(){
                                        return vehicletitle1 = "null" ;
                                    }
                                    function vehicleTitle2(){
                                        return vehicletitle2 = "null" ;
                                    }
                                        var vehicletitle1 = vehicleTitle1()
                                        var vehicletitle2 = vehicleTitle2()
                                }else if(req.files.vehicletitle.length == 1){
//vehicletitle1  
                                        function vehicleTitle1(){
                                        if(typeof req.files.vehicletitle[0].filename !== undefined){
                                        return vehicletitle1 = req.files.vehicletitle[0].filename
                                        }
                                        }
                                var vehicletitle1 = vehicleTitle1()
                                }else if(req.files.vehicletitle.length == 2){
//vehicletitle2
                                        function vehicleTitle1(){
                                        if(typeof req.files.vehicletitle[0].filename !== undefined){
                                        return vehicletitle1 = req.files.vehicletitle[0].filename
                                        }
                                        }
//vehicletitle2 
                                        function vehicleTitle2(){      
                                        if(typeof req.files.vehicletitle[1].filename !== undefined){
                                        return vehicletitle2 = req.files.vehicletitle[1].filename
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
                                        return vehicleinsurance1 = "null" ;
                                    }
                                    function vehicleInsurance2(){
                                        return vehicleinsurance2 = "null" ;
                                    }
                                        var vehicleinsurance1 = vehicleInsurance1()
                                        var vehicleinsurance2 = vehicleInsurance2()
                                }else if(req.files.vehicleinsurance.length == 1){
//vehicleinsurance1  
                                        function vehicleInsurance1(){
                                        if(typeof req.files.vehicleinsurance[0].filename !== undefined){
                                        return vehicleinsurance1 = req.files.vehicleinsurance[0].filename
                                        }
                                        }
                                var vehicleinsurance1 = vehicleInsurance1()
                                }else if(req.files.vehicleinsurance.length == 2){
//vehicleinsurance2
                                        function vehicleInsurance1(){
                                        if(typeof req.files.vehicleinsurance[0].filename !== undefined){
                                        return vehicleinsurance1 = req.files.vehicleinsurance[0].filename
                                        }
                                        }
//vehicleinsurance2 
                                        function vehicleInsurance2(){      
                                        if(typeof req.files.vehicleinsurance[1].filename !== undefined){
                                        return vehicleinsurance2 = req.files.vehicleinsurance[1].filename
                                        }
                                        }
                                        var vehicleinsurance1 = vehicleinsurance1()
                                        var vehicleinsurance2 = vehicleinsurance2()
                                }else{
                                    console.log("No vehicle insurance image has been attached");
                                }
            
                               

                        connection.query('INSERT INTO bus SET bus_image_front = ?,bus_image_back = ?,bus_image_side = ?,bus_title_image1 = ?,bus_title_image2 = ?,bus_insurance_image1 = ?,bus_insurance_image2 = ?,driver_id = ?,bus_verification = ?',[vehiclefront,vehicleback,vehicleside,vehicletitle1,vehicletitle2,vehicleinsurance1,vehicleinsurance2,driver_id,"pending"],function(err,save){
                           

                            if(err){
                                res.json({
                                    status : false,
                                    message : "Error Occured" + err
                                });
                            }else{

                                var bus_id = save.insertId;

                                connection.query('UPDATE driver SET bus_id = ? WHERE driver_id = ?',[bus_id,driver_id],function(err,done){

                                        if(err){
                                            res.json({
                                                status: false,
                                                message: "Error Occured " + err
                                            })
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


                                })


                               
                            } 
                        });
                               

                    }else if(bus !=0 ){

            

            
                                                                 
//
                                if(req.files.vehiclefront == undefined){
//vehiclefront
                                    function vehicleFront(){
                                        return vehiclefront = bus[0].bus_image_front ;
                                    }
                                    var vehiclefront = vehicleFront()
                                }else if(req.files.vehiclefront.length == 1){
                                function vehicleFront(){
                                     if(typeof req.files.vehiclefront[0].filename !== undefined){
                                    return vehiclefront = req.files.vehiclefront[0].filename
                                }else{
                                    return vehiclefront = bus[0].bus_image_front
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
                                        return vehicleback = bus[0].bus_image_back ;
                                    }
                                    var vehicleback = vehicleBack()
                                }else if(req.files.vehicleback.length == 1){
                                function vehicleBack(){
                                     if(typeof req.files.vehicleback[0].filename !== undefined){
                                    return vehicleback = req.files.vehicleback[0].filename
                                }else{
                                    return vehicleback = bus[0].bus_image_back
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
                                        return vehicleside = bus[0].bus_image_side ;
                                    }
                                    var vehicleside = vehicleSide()
                                }else if(req.files.vehicleside.length == 1){
                                function vehicleSide(){
                                     if(typeof req.files.vehicleside[0].filename !== undefined){
                                    return vehicleside = req.files.vehicleside[0].filename
                                }else{
                                    return vehicleside = bus[0].bus_image_side
                                }
                                }
                                var vehicleside = vehicleSide()
                                }else{
                                    console.log("No vehicle side image has been attached");
                                }
                                


                         



//vehicletitle 
                                if(req.files.vehicletitle == undefined){
                                    function vehicleTitle1(){
                                        return vehicletitle1 = bus[0].bus_title_image1 ;
                                    }
                                    function vehicleTitle2(){
                                        return vehicletitle2 = bus[0].bus_title_image2 ;
                                    }
                                        var vehicletitle1 = vehicleTitle1()
                                        var vehicletitle2 = vehicleTitle2()
                                }else if(req.files.vehicletitle.length == 1){
//vehicletitle1  
                                        function vehicleTitle1(){
                                        if(typeof req.files.vehicletitle[0].filename !== undefined){
                                        return vehicletitle1 = req.files.vehicletitle[0].filename
                                        }else{
                                        return vehicletitle1 = bus[0].bus_title_image1
                                        }
                                        }
                                var vehicletitle1 = vehicleTitle1()
                                }else if(req.files.vehicletitle.length == 2){
//vehicletitle2
                                        function vehicleTitle1(){
                                        if(typeof req.files.vehicletitle[0].filename !== undefined){
                                        return vehicletitle1 = req.files.vehicletitle[0].filename
                                        }else{
                                        return vehicletitle1 = bus[0].bus_title_image1
                                        }
                                        }
//vehicletitle2 
                                        function vehicleTitle2(){      
                                        if(typeof req.files.vehicletitle[1].filename !== undefined){
                                        return vehicletitle2 = req.files.vehicletitle[1].filename
                                        }else{
                                        return vehicletitle2 = bus[0].bus_title_image2
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
                                        return vehicleinsurance1 = bus[0].bus_insurance_image1 ;
                                    }
                                    function vehicleInsurance2(){
                                        return vehicleinsurance2 = bus[0].bus_insurance_image2 ;
                                    }
                                        var vehicleinsurance1 = vehicleInsurance1()
                                        var vehicleinsurance2 = vehicleInsurance2()

                                }else if(req.files.vehicleinsurance.length == 1){
//vehicleinsurance1  
                                        function vehicleInsurance1(){
                                        if(typeof req.files.vehicleinsurance[0].filename !== undefined){
                                        return vehicleinsurance1 = req.files.vehicleinsurance[0].filename
                                        }else{
                                        return vehicleinsurance1 = bus[0].bus_insurance_image1
                                        }
                                        }
                                var vehicleinsurance1 = vehicleInsurance1()
                                }else if(req.files.vehicleinsurance.length == 2){
//vehicleinsurance2
                                        function vehicleInsurance1(){
                                        if(typeof req.files.vehicleinsurance[0].filename !== undefined){
                                        return vehicleinsurance1 = req.files.vehicleinsurance[0].filename
                                        }else{
                                        return vehicleinsurance1 = bus[0].bus_insurance_image1
                                        }
                                        }
//vehicleinsurance2 
                                        function vehicleInsurance2(){      
                                        if(typeof req.files.vehicleinsurance[1].filename !== undefined){
                                        return vehicleinsurance2 = req.files.vehicleinsurance[1].filename
                                        }else{
                                        return vehicleinsurance2 = bus[0].bus_insurance_image2
                                        }
                                        }
                                        var vehicleinsurance1 = vehicleInsurance1()
                                        var vehicleinsurance2 = vehicleInsurance2()
                                }else{
                                    console.log("No vehicle insurance image has been attached");
                                }




                            


                    connection.query('UPDATE bus SET bus_image_front = ?,bus_image_back = ?,bus_image_side = ?,bus_title_image1 = ?,bus_title_image2 = ?,bus_insurance_image1 = ?,bus_insurance_image2 = ? WHERE driver_id',[vehiclefront,vehicleback,vehicleside,vehicletitle1,vehicletitle2,vehicleinsurance1,vehicleinsurance2,driver_id],function(err,save){
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



// Driver Location Update

busRoutes.post('/location',function(req,res){

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

                    connection.query('SELECT account_status FROM driver WHERE driver_id = ?',[driverid],function(err,account){
                        if(err){
                            res.json({
                                status: false,
                                message: "Error Occured " + err
                            })
                        }else{

                                var account_status = account[0].account_status ;

                             res.json({
                                status : true,
                                account_status: account_status,
                                message : "Location Updated successfully"
                            });

                        }
                    })
       
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


                    connection.query('SELECT account_status FROM driver WHERE driver_id = ?',[driverid],function(err,account){
                        if(err){
                            res.json({
                                status: false,
                                message: "Error Occured " + err
                            })
                        }else{

                            var account_status = account[0].account_status ;

                             res.json({
                                status : true,
                                account_status: account_status,
                                message : "Location Updated successfully"
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


//Driver viewing Jobs

busRoutes.post('/showjobs',function(req,res){

    var driver_id = req.headers['id'];

    var latitude = req.body.latitude ;
    var longitude = req.body.longitude ;
    var radius = req.body.radius ;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code : 100,
                message : "Error in connecting Database"
            })
        }

    
    connection.query('SELECT booking_id,customer_id,pickup_location,drop_location,delivery_address,vehicle_type,description,goods_image1,goods_image2,goods_image3,goods_image4,goods_image5,booking_time, ( 3959 * acos( cos( radians(' + latitude + ') ) * cos( radians( pickup_latitude ) ) * cos( radians( pickup_longitude ) - radians(' +longitude + ') ) + sin( radians(' + latitude + ') ) * sin( radians( pickup_latitude ) ) ) ) AS distance FROM bookings WHERE job_status = ? AND goods_type = ? AND booking_id NOT IN (SELECT booking_id FROM job_bidding WHERE driver_id =' + driver_id + ')' + 'HAVING distance <' + radius +' ORDER BY distance LIMIT 0 , 20 ',["waiting","passenger"],function(err,job){
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



// Driver Bidding for Job

busRoutes.post('/jobbidding',function(req,res){

    var driver_id = req.headers['id'];

    var booking_id = req.body.booking_id ;
    var bidding_cost = req.body.bidding_cost ;
    var bidding_time = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss')

    pool.getConnection(function(err,connection){
        if(err) throw err ;



            connection.query('INSERT INTO job_bidding SET driver_id = ?,booking_id = ?,bidding_cost = ?,bidding_time = ?',[driver_id,booking_id,bidding_cost,bidding_time],function(err,save){
                if(err){
                    res.json({
                        status :false,
                        message : "Error Occured" + err
                    })
                }else{
                    res.json({
                        status : true,
                        message : "You have successfully bidded for the job"
                    });
                }
        });

    
            connection.release();
    })
});


//Driver viewing current job

busRoutes.post('/jobhistory',function(req,res){
    
    var driver_id = req.headers['id'];

    pool.getConnection(function(err,connection){
        if(err) throw err;

        connection.query('SELECT bookings.*,customer.customer_name,customer.customer_mobile,customer.customer_image FROM bookings INNER JOIN customer ON bookings.customer_id = customer.customer_id WHERE driver_id = ? AND job_status = ?',[driver_id,"confirmed"],function(err,info){
            if(err){
                res.json({
                    status: false,
                    message: "Error Occured " + err
                });
            }else{
                res.json({
                    status: true,
                    message: info
                });
            }
        });
            
        connection.release();
    })


});


busRoutes.post('/finishjob',function(req,res){

    var driver_id = req.headers['id'];
    var job_completed_time = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss')
    var booking_id = req.body.booking_id;

    pool.getConnection(function(err,connection){
        if(err) throw err;


    connection.query('UPDATE driver SET driver_job_status = ? WHERE driver_id = ?',["free",driver_id],function(err,driver){
        if(err){
            res.json({
                status: false,
                message: "Error Occured "+ err
            });
        }else{
            connection.query('UPDATE bookings SET job_completed_time = ? WHERE booking_id = ?',[job_completed_time,booking_id],function(err,bookings){
                if(err){
                        res.json({
                        status: false,
                        message: "Error Occured "+ err
                });
                }else{
                    res.json({
                        status: true,
                        message: "Current job has been successfully completed and you can bid for new job"
                    })
                }
            })
        }
    })
        connection.release();
    })

})



//Bank Details Update


busRoutes.post('/bankupdate',function(req,res){


    var driver_id = req.headers['id'];

    var bank_name = req.body.bank_name;
    var routing_number = req.body.routing_number;
    var account_number = req.body.account_number;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }

    
    connection.query('SELECT * FROM driver_bank WHERE driver_id = ?',[driver_id],function(err,bank){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else if(bank.length != 1){
            connection.query('INSERT INTO driver_bank SET driver_id = ?,bank_name = ?,routing_number = ?,account_number = ?',[driver_id,bank_name,routing_number,account_number],function(err,insert){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                    res.json({
                        status: true,
                        message: "Bank Details has been Added successfully"
                    })
                }
            })
        }else if(bank.length == 1){
            connection.query('UPDATE driver_bank SET bank_name = ?,routing_number = ?,account_number = ? WHERE driver_id = ?',[bank_name,routing_number,account_number,driver_id],function(err,update){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                    res.json({
                        status: true,
                        message: "Bank Details has been Updated successfully"
                    })
                }
            })
        }
    })



        connection.release();
    })


})



//View Bank Details

busRoutes.post('/viewbankdetails',function(req,res){

    var driver_id = req.headers['id'];

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }


    connection.query('SELECT * FROM driver_bank WHERE driver_id = ?',[driver_id],function(err,details){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: details
            })
        }
    })




        connection.release();
    })

})









app.use('/busdriver',busRoutes);






}