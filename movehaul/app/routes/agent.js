var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var moment = require('moment');
var multer = require('multer');
var mime = require('mime');
var nodemailer = require('nodemailer');
var easyid = require('easyid');


var pool = require('../connection');


//Twilio Configuration

var twilio = require('twilio');

var accountSid = 'AC78e3aefc278a8184d567d7041b97bb20';
var authToken = 'aa199ed7aa3914d3fe9e3583ad8a6f20';

var client = twilio(accountSid,authToken);


//Nodemailer Configuration

var smtpTransport = nodemailer.createTransport('smtps://movehaul.developer%40gmail.com:Noble_1234@smtp.gmail.com');




// Agent Upload Storage



var agentimagestorage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'C:/wamp64/www/movehaul/assets/img/agent_details');
    },
    filename : function(req,file,cb){
        var datetimestamp = Date.now();
        var userid = req.headers['id'];
        cb(null,userid + '-' +file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});

var agentimageupload = multer({
    storage : agentimagestorage
}).fields([{
    name : 'agentimage', maxCount : 1
},{
    name : 'agentidentity', maxCount : 1
}]);


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






module.exports = function(app){






// Agent Signup

app.post('/agentsignup',function(req,res){

    var created = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss')

    var agent_name = req.headers['agent_name'];
    var agent_mobile = req.headers['agent_mobile'];
    var agent_email = req.headers['agent_email'];
    var agent_region = req.headers['agent_region'];
    var agent_bank = req.headers['agent_bank'];
    var agent_account_no = req.headers['agent_account_no'];
    var agent_city = req.headers['agent_city'];
    var agent_state = req.headers['agent_state'];
    var agent_address = req.headers['agent_address'];
    var agent_coverage_area = req.headers['agent_coverage_area'];

    var agentsignup = {agent_name:agent_name,agent_mobile:agent_mobile,agent_email:agent_email,agent_region:agent_region,agent_bank:agent_bank,agent_account_no:agent_account_no,agent_city:agent_city,agent_state:agent_state,agent_address:agent_address,agent_coverage_area:agent_coverage_area,agent_verification: "pending",agent_status: "inactive"}


    agentimageupload(req,res,function(err){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{


            pool.getConnection(function(err,connection){
                if(err){
                    res.json({
                        code: 100,
                        status: false,
                        message: "Error in connecting Database"
                    })
                }


            connection.query('INSERT INTO agent SET?',agentsignup,function(err,info){
                if(err){
                    res.json({
                        status: false,
                        message: "Error in connecting Database"
                    })
                }else{

                    var agent_image = req.files.agentimage[0].filename;
                    var agent_identity = req.files.agentidentity[0].filename

                    connection.query('UPDATE agent SET agent_image = ?,agent_identity = ? WHERE id = ?',[agent_image,agent_identity,info.insertId],function(err,save){
                        if(err){
                            res.json({
                                status: false,
                                message: "Error Occured " + err
                            })
                        }else{
                            res.json({
                                status: true,
                                message: "You have been successfully registered with movehaul as agent."
                            })
                        }
                    })



                }
            })


                connection.release();
            })

        }
    })



})


// Agent OTP

app.post('/agentotp',function(req,res){

    agent_mobile = req.body.agent_mobile;

    var otp = Math.floor(Math.random()*9000)+1000;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code: 100,
                status: false,
                message: "Error in connecting Database"
            });
        }


        connection.query('SELECT * FROM agent WHERE agent_mobile = ?',[agent_mobile],function(err,mobile){
            if(err) throw err;



            if(mobile == 0){
                res.json({
                    status: false,
                    message: "Register with Movhaul first to generate OTP"
                })
            }else if(mobile[0].agent_verification == "verified"){

                var agent_email = mobile[0].agent_email ;



                  connection.query('SELECT * FROM agent WHERE agent_email = ?',[agent_email],function(err,email){
        if(err) throw err;

        if(email == 0){
            res.json({
                status : false,
                message : "Register with Movehaul first to Generate OTP"
            });
        }else{
                var username = email[0].agent_name ;
                var mailOptions = smtpTransport.templateSender({
                    subject : "OTP for MoveHaul APP",
                    html : "<b>Hello <strong>{{username}}</strong>,your One Time Password for MoveHaul App is <span style=color:blue>{{password}}</span></b>"
                },{
                    from : 'movehaul.developer@gmail.com'
                });

                mailOptions({
                    to : agent_email
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


                            connection.query('UPDATE agent SET agent_otp = ? WHERE agent_email = ?',[otp,agent_email],function(err,save){
                                if(err){
                                    res.json({
                                        status : false,
                                        message : "Error Occured" + err
                                    });
                                }else{
                                   

                                   connection.query('SELECT * FROM agent WHERE agent_mobile = ?',[agent_mobile],function(err,mobile){
        if(err) throw err ;

        if(mobile == 0){
                res.json({
                status : false,
                message : "Register with Movehaul first to Generate OTP"
            });      
        }else{
            client.messages.create({
                body : "Your MoveHaul OTP is" + " " + otp,
                to : agent_mobile,
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
            else{
                res.json({
                    status : false,
                    message: {
                    agent_verification : mobile[0].agent_verification
                    }
                })
            }

        }); 
    


        connection.release();
    })

})





var agentRoutes = express.Router();


//  Agent Login


agentRoutes.post('/login',function(req,res){

    var agent_mobile = req.body.agent_mobile;
    var agent_otp = req.body.agent_otp;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                code: 100,
                status: false,
                message: "Error in connecting Database"
            })
        }

    
    connection.query('SELECT * FROM agent WHERE agent_mobile = ?',[agent_mobile],function(err,mobile){
        if(err) throw err;

        if(mobile == 0){
            res.json({
                status: false,
                message: "Authentication failed.User not found"
            })
        }else if(mobile != 0){
            if(mobile[0].agent_otp != agent_otp){
                res.json({
                    status: false,
                    message: "Authentication failed.Wrong Password"
                })
            }else{

                var token = jwt.sign(mobile[0].agent_mobile,app.get('superSecret'));

                var id = mobile[0].id;
                var agent_name = mobile[0].agent_name
                var agent_mobile = mobile[0].agent_mobile
                var agent_email = mobile[0].agent_email
                var agent_region = mobile[0].agent_region
                var agent_bank = mobile[0].agent_bank
                var agent_account_no = mobile[0].agent_account_no
                var agent_city = mobile[0].agent_city
                var agent_state = mobile[0].agent_state
                var agent_address = mobile[0].agent_address
                var agent_coverage_area = mobile[0].agent_coverage_area

                var agent_image = mobile[0].agent_image;
                var agent_identity = mobile[0].agent_identity;


                res.json({
                    status: true,
                    message: "Logged in successfully",
                    token: token,
                    id: id,
                    agent_name: agent_name,
                    agent_mobile: agent_mobile,
                    agent_email: agent_email,
                    agent_region: agent_region,
                    agent_bank: agent_bank,
                    agent_account_no: agent_account_no,
                    agent_city: agent_city,
                    agent_state: agent_state,
                    agent_address: agent_address,
                    agent_coverage_area: agent_coverage_area,
                    agent_image: agent_image,
                    agent_identity: agent_identity
                })

            }
        }
    })



        connection.release();
    })

})




agentRoutes.use(function(req,res,next){
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



// Company Register


agentRoutes.post('/companyregister',function(req,res){

    var id = req.headers['id'];

    var company_name = req.body.company_name;
    var contact_person = req.body.contact_person;
    var phone = req.body.phone;
    var email = req.body.email;
    var corporate_id = req.body.corpotate_id;
    var address = req.body.address;

    var agent_id = id;


    var companyregister = {company_name: company_name,contact_person: contact_person,phone: phone,email: email,corporate_id: corporate_id,address: address,agent_id: agent_id};


    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }


    connection.query('INSERT INTO company SET?',companyregister,function(err,company){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: "Your company has been successfully registered with movehaul"
            })
        }
    
    })



        connection.release();
    })

})


// Driver Register 


agentRoutes.post('/driverregister',function(req,res){

    var id = req.headers['id'];

    var created = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss')

    var num2 = easyid.generate({
        groups: 1,
        length: 2,
        alphabet: '0123456789'
    })

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


    var driver_name = req.headers['driver_name'];
    var driver_email = req.headers['driver_email'];
    var driver_mobile_pri = req.headers['driver_mobile_pri'];
    var driver_mobile_sec = req.headers['driver_mobile_sec'];
    var driver_experience = req.headers['driver_experience'];
    var driver_licence_name = req.headers['driver_licence_name'];
    var driver_licence_number = req.headers['driver_licence_number'];
    var created_date = created;
    var driver_job_status = "free";
    var driver_operated_by = req.headers['driver_operated_by'];
    var driver_verification = "pending";

    var driver_status = "inactive"

    var account_status = "inactive"

    var vehicle_type = req.headers['vehicle_type'];
    var driver_address = req.headers['driver_address'];
    var service_type = req.headers['service_type'];
    var primary_route = req.headers['primary_route'];
    var service_areas_distance = req.headers['service_areas_distance'];
    var local_government = req.headers['local_government'];
    var service_areas = req.headers['service_areas'];
    var reference1 = req.headers['reference1'];
    var reference2 = req.headers['reference2'];
    var reference3 = req.headers['reference3'];
    


    var agent_id = id;

    var driversignup = {driver_name: driver_name,driver_email: driver_email,driver_mobile_pri: driver_mobile_pri,driver_mobile_sec: driver_mobile_sec,driver_experience: driver_experience,driver_licence_name: driver_licence_name,driver_licence_number: driver_licence_number,created_date: created_date,fake_id: fake_id,driver_job_status: driver_job_status,driver_operated_by: driver_operated_by,driver_verification:driver_verification,driver_status: driver_status,account_status: account_status,vehicle_type: vehicle_type,driver_address: driver_address,service_type: service_type,primary_route: primary_route,service_areas_distance: service_areas_distance,local_government: local_government,service_areas: service_areas,reference1: reference1,reference2: reference2,reference3: reference3,agent_id: agent_id}


    


    driverlicenceupload(req,res,function(err){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            pool.getConnection(function(err,connection){
                if(err){
                    res.json({
                        status: false,
                        code: 100,
                        message: "Error in connecting Database"
                    })
                }


            connection.query('INSERT INTO driver SET?',driversignup,(err,save) => {
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                    var driver_licence_image = req.files[0].filename

                    var driver_id = save.insertId;

                    connection.query('UPDATE driver SET driver_licence_image = ? WHERE driver_id = ?',[driver_licence_image,driver_id],(err,done)=> {
                        if(err){
                            res.json({
                                status: false,
                                message: "Error Occured " + err
                            })
                        }else{
                            res.json({
                                status: true,
                                message: "The driver has been successfully added"
                            })
                        }
                    })                
                }
            })



    


            connection.release();

            })

        }


    })


})




// Get Company Driver





agentRoutes.post('/getcompanydriver',function(req,res){

    let id = req.headers['id'];


    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }


        connection.query('SELECT * FROM company WHERE agent_id = ?',[id],(err,company) => {
            if(err){
                res.json({
                    status: false,
                    message: "Error Occured " + err
                })
            }else{

                let companydata = company

                connection.query('SELECT * FROM driver WHERE agent_id = ?',[id],(err,driver) => {
                    if(err){
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        })
                    }else{
                        res.json({
                            status: true,
                            company: companydata,
                            driver: driver
                        })
                    }
                })



            }
        })


        connection.release()
    })

})












app.use('/agent',agentRoutes);




    
}