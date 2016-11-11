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
        cb(null,'./public/driverlicence');
    },
    filename : function(req,file,cb){
        var datetimestamp = Date.now();
        var userid = req.headers['id'];
        cb(null,userid + '-' + file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});

var driverlicenceupload = multer({
    storage : driverlicencestorage
}).array('driverlicence',1);

//Driver Update

var driverupdatestorage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/driverupdate');
    },
    filename : function(req,file,cb){
        var datetimestamp = Date.now();
        var userid = req.headers['id'];
        cb(null,userid + '-' +file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});

var driverupdateupload = multer({
    storage : driverupdatestorage
}).fields([{
    name : 'driverimage', maxCount : 1
},{
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

// Driver Signup

app.post('/driversignup',function(req,res){
    var created = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss')
    var driversignup = {driver_name:req.headers['driver_name'],driver_mobile_pri:req.headers['driver_mobile_pri'],driver_email:req.headers['driver_email'],driver_mobile_sec:req.headers['driver_mobile_sec'],driver_experience:req.headers['driver_experience'],driver_licence_name:req.headers['driver_licence_name'],driver_licence_number:req.headers['driver_licence_number'],driver_licence_image:req.files,created_date:created};

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


//Driver Mobile OTP

app.post('/drivermobileotp',function(req,res){
    var drivermobile = req.body.driver_mobile ;
    var otp = Math.floor(Math.random()*9000)+1000;

      pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code : 100,
                status : "Error in connecting Database"
            });
        }

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
                }else{
                    connection.query('UPDATE driver SET driver_otp = ? WHERE driver_mobile_pri = ?',[otp,drivermobile],function(err,save){
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
        }else{
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

                    var id = mobile[0].driver_id ;
                    var driver_mobile = mobile[0].driver_mobile_pri;
                    var driver_email = mobile[0].driver_email;

                    res.json({
                        status : true,
                        message : "Logged in successfully",
                        id : id,
                        driver_mobile : driver_mobile,
                        driver_email : driver_email,
                        token : token
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

                    var id = email[0].driver_id ;
                    var driver_mobile = email[0].driver_mobile_pri;
                    var driver_email = email[0].driver_email;

                    res.json({
                        status : true,
                        message : "Logged in successfully",
                        id : id,
                        driver_mobile : driver_mobile,
                        driver_email : driver_email,
                        token : token
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














app.use('/driver',apiRoutes);


}





