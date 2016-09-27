var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var multer = require('multer');
var mime = require('mime');
var nodemailer = require('nodemailer');
var moment = require('moment');

var User = require('./models/user');
var Email = require('./models/email');

//User Profile Upload

var userStorage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/user');
    },
    filename : function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    } 
});

var userUpload = multer({
    storge : userStorage
}).single('file');

//User Complaint Image Upload

var complaintStorage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/complaint');
    },
    filename : function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});

var complaintUpload = multer({
    storage : complaintStorage
}).array('file',4);

// Nodemailer

var smtpTransport = nodemailer.createTransport('smtps://sqtesting2016%40gmail.com:P@$$word@123@smtp.gmail.com');


//Route

module.exports = function(app){

//Resident Email verification

app.post('/emailverify',function(req,res){
    Email.findOne({
        email : req.body.email,
        auth : req.body.auth,
        username : req.body.username
    },function(err,email){
        if(err) throw err;

        if(!email){
            var mailOptions = smtpTransport.templateSender({
            subject : "Email Verification Code for Apartment Complaints",
            html : "<b>Hello <strong>{{username}}</strong>,your Four Digit Verification code is <span style=color:red;>{{auth}}</span></b>"
            },{
            from : "sqtesting2016@gmail.com"
            });
            mailOptions({
                 to : req.body.email
            },{
                 username : req.body.username,
                 auth : req.body.auth
            },function(err,info){
                 if(err){
                 res.json({
                 status: false,
                 message : "Error Occured" + err
                 });
                }else{
                    res.json({
                        status : true,
                        message : "Email Verification code sent to your Mail"
                    });
                     }
             });
            smtpTransport.close();    
        }else{
            res.json({
                status : false,
                message : "Mail already sent to your E-mail address"
            });
        }
    });
});

//Secretary Static

app.post('/secretary',function(req,res){
    var secretary = new User({
        username : 'Sqindia',
        mobileno : '123456',
        email : 'secretary@sqindia.net',
        password : '1234',
        confirm : true,
        admin : true
    });
    secretary.save(function(err){
        if(err) throw err;

        console.log("Secretary saved successfully");
        res.json({status : true});
    });
});

app.post('/resident',function(req,res){
    var resident = new User({
        username : 'Resident',
        mobileno : '654321',
        email : 'resident@sqindia.net',
        password : '1234',
        admin : false,
        conifrmstatus : false,
        blockno : "1",
        houseno : "s2",
        apartment : "ganesh",
        floorno : "3"
    });
    resident.save(function(err){
        if(err) throw err;

        console.log("Resident saved successfully");
        res.json({status : true});
    });
});

//Secretary Email Verification

app.post('/emailverifysec',function(req,res){
    var mailOptions = smtpTransport.templateSender({
        subject : "Email Verification Code for Secretary Registration",
        html : "<b>Hello <strong>{{username}}</strong>,your Four digit verification code for Secretary Registration is <span style=color:red;>{{auth}}</span></b>"
    },{
        from: "sqtesting2016@gmail.com"
    });

    mailOptions({
        to: "csuresh.umi@gmail.com"
    },{
        username: req.body.username,
        auth : req.body.auth
    },function(err,info){
        if(err){
            res.json({
                status: false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status:true,
                message : "Mail sent successfully"
            });
        }
    });
    smtpTransport.close();
});

//Resident Signup

app.post('/signupres',function(req,res){
      User.findOne({apartment:req.body.apartment,blockno:req.body.blockno,floorno:req.body.floorno,houseno:req.body.houseno,username:req.body.username,email:req.body.email,phoneno:req.body.phoneno},function(err,user){
            if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{
                if(user){
                    res.json({
                        status : false,
                        message : "User alredy exists!"
                    });
                }else{
                    var userModel = new User();
                    userModel.apartment = req.body.apartment;
                    userModel.blockno = req.body.blockno;
                    userModel.floorno = req.body.floorno;
                    userModel.houseno = req.body.houseno;
                    userModel.username = req.body.username;
                    userModel.email = req.body.email;
                    userModel.phoneno = req.body.phoneno;
                    userModel.password = req.body.password;
                    userModel.save(function(err,user){
                        user.save(function(err,user1){
                            res.json({
                                status : true,
                                message : "Wait for your Confirmation Mail!"
                            });
                        });
                    });
                }
            }
            });
});

//Secretary Signup

app.post('/signupsec',function(req,res){
      User.findOne({apartment:req.body.apartment,blockno:req.body.blockno,floorno:req.body.floorno,houseno:req.body.houseno,username:req.body.username,email:req.body.email,phoneno:req.body.phoneno},function(err,user){
            if(err){
                res.json({
                    status : false,
                    message : "Error Occured" + err
                });
            }else{
                if(user){
                    res.json({
                        status : false,
                        message : "User alredy exists!"
                    });
                }else{
                    var userModel = new User();
                    userModel.apartment = req.body.apartment;
                    userModel.blockno = req.body.blockno;
                    userModel.floorno = req.body.floorno;
                    userModel.houseno = req.body.houseno;
                    userModel.username = req.body.username;
                    userModel.email = req.body.email;
                    userModel.phoneno = req.body.phoneno;
                    userModel.password = req.body.password;
                    userModel.admin = true;
                    userModel.confirm = true;
                    userModel.save(function(err,user){
                        user.save(function(err,user1){
                            res.json({
                                status : true,
                                message : "Wait for your Resident Status check!"
                            });
                        });
                    });
                }
            }
            });
});


var apiRoutes = express.Router();

//User Login

apiRoutes.post('/login',function(req,res){
User.findOne({
    email : req.body.email,
    confirm : true
},function(err,user){
    if(err) throw err;

    if(!user){
        res.json({
            status : false,
            message : 'Authentication failed.User not found'
            });
        }else if(user){
            if(user.password != req.body.password){
                res.json({
                    status : false,
                    message : "Authentication failed.Wrong password"
                    });
                }else{
                    var token = jwt.sign(user,app.get('superSecret'),{
                        expiresIn : "24h"
                    });

                    var id = user._id;
                    var admin = user.admin;

                    res.json({
                        status : true,
                        message : 'Logged in successfully!',
                        id : id,
                        sessiontoken : token,
                        admin : admin
                    });
                
            }
        
    }
});
});

apiRoutes.use(function(req,res,next){
    var token = req.body.token || req.query.token || req.headers['sessiontoken'];

    if(token){
        jwt.verify(token,app.get('superSecret'),function(err,decoded){
            if(err){
                return res.json({
                    status : false,
                    message : 'Failed to Authenticate token'
                });
            }else{
                req.decoded = decoded;
                next();
            }
        });
    }else{
        return res.status(403).send({
            status : false,
            message : "No token provided"
        });
    }
});

//Secretary finding new Resident

apiRoutes.post('/newresident',function(req,res){
    User.find({"confirm":false,"admin":false},{"apartment":1,"blockno":1,"floorno":1,"houseno":1,"username":1,"email":1,"phoneno":1},
    function(err,info){
        if(err){
            res.json({
                status : false,
                message : "No new Residents registered"
            });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    }    
    
    )
});

//Secretary confirming Resident

apiRoutes.post('/newresident/confirm',function(req,res){
    var query = req.body.id;
    User.findByIdAndUpdate(query,{$set:{confirm:true}},{new:true},function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Try again"
            });
        }else{
            res.json({
                status : false,
                message : "Resident has been confirmed"
            });
        }
    });

});

//Secretary rejecting new resident

apiRoutes.post('/newresident/reject',function(req,res){
    var query = req.body.id;
    User.findByIdAndRemove(query,function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Try again"
            });
        }else{
            res.json({
                status : false,
                message : "Application has been successfully removed"
            });
        }
    });
});

//Secretary Viewing Recent tickets

apiRoutes.post('/recenttickets',function(req,res){
    User.find({"admin":false},{"raiseticket":{$elemMatch:{"ticketstatus":false}}},{"apartment":1,"blockno":1,"floorno":1,"hoseno":1,"username":1,"email":1,"phoneno":1,},
    function(err,info){
        if(err){
            res.json({
                status : false,
                message : "No new Tickets"
            });
        }else{
            res.json({
                status: true,
                message : info
            });
        }
    }
    )
});

//User Uploading photo

apiRoutes.post('/user/upload',function(req,res){
    var query = req.headers['id'];
    userUpload(req,res,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            User.update({"_id":query},{$set:{"uploadphoto":req.file.path}},
            {safe:true,upsert:true,new:true},
            function(err,info1){
                if(err){
                    res.json({
                        status : false,
                        message : "Error Occured" + err
                    });
                }else{
                    res.json({
                        status : true,
                        message : "Profile Image has been added successfully"
                    });
                }
            });
        }
    });
});


//User Raising new Ticket

apiRoutes.post('/resident/raiseticket',function(req,res){
    var query = req.headers['id'];
   
    var a = moment().get('date');
    var b = moment().get('hour')
    var c = moment().get('minute');

    var ticket = "IRIS" + a + "-" + b + "-" + c;


    complaintUpload(req,res,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            var ticket = Date();
            User.findByIdAndUpdate(query,{$push:{"raiseticket":{ticketid:ticket,complaint:req.body.complaint,description:req.body.descrtiption,imageurl:req.files}}},
            {safe:true,upsert:true,new:true},
            function(err,info){
                if(err){
                    res.json({
                        status : false,
                        message : "Error Occured" + err
                    });
                }else{
                    res.json({
                        status : true,
                        message : "Your ticket has been added successfully"
                    });
                }
            }
            );
        }
    });
});










app.use('/api',apiRoutes);


}