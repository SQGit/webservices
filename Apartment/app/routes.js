var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var multer = require('multer');
var mime = require('mime');
var nodemailer = require('nodemailer');
var moment = require('moment');

var User = require('./models/user');

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
     var emailverify = Math.floor(Math.random()*9000)+1000;

     User.findOne({email:req.body.email},function(err,email){
         if(err) throw err;
         else{
             if(email){
                 res.json({
                     status : false,
                     message : "Mail has been sent to your email already"
                 });
             }else{
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
                        auth : emailverify
                    },function(err,email){
                        if(err){
                 res.json({
                 status: false,
                 message : "Error Occured" + err
                 });
                }else{
                    var userModel = new User();
                    userModel.username = req.body.username;
                    userModel.email = req.body.email;
                    userModel.blockno = req.body.blockno;
                    userModel.houseno = req.body.houseno;
                    userModel.apartment = req.body.apartment;
                    userModel.floorno = req.body.floorno;
                    userModel.phoneno = req.body.phoneno;
                    userModel.password = req.body.password;
                    userModel.emailverify = emailverify;
                    userModel.uploadphoto = null;
                    userModel.save(function(err,email){
                        email.save(function(err,email1){
                             res.json({
                                status : true,
                                message : "Email Verification code sent to your Mail",
                                emailverify : emailverify
                                    });

                        });
                    });
                        }
                             smtpTransport.close();
                    });

             }
         }
     });

});

    


//Email Success

app.post('/emailsuccess',function(req,res){
    
    User.findOne({username:req.body.username,email:req.body.email,phoneno:req.body.phoneno,password:req.body.password,emailverify:req.body.emailverify,emailverifystatus:false},function(err,email){
        if(err) throw err;

        if(!email){
            res.json({
                status: false,
                message : "Authentication failed.Wrong code!"
            });
        }else if(email){
            if(email.emailverify != req.body.emailverify){
                res.json({
                    status : false,
                    message : "Authentication failed.Wrong code!"
                });
            }  else{
            query = email._id ;
               User.findByIdAndUpdate(query,{$set:{emailverifystatus:true}},{new:true},function(err,info){
                if(err){
                    res.json({
                        status : false,
                        message : "Try again"
                    });
                }else{
                    res.json({
                        status: true,
                        message : "Wait for your Confirmation Check"
                    });
                }
            });
        } 
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

//

//Resident Signup

//

//Secretary Signup

//

//Forget password

app.post('/password/forget',function(req,res){
    User.findOne({email : req.body.email },function(err,email){
        if(err) throw err;

        if(!email){
            res.json({
                status : false,
                message : "Invalid Email"
            });
        }else if(email){
            if(email.emailverifystatus != true){
                res.json({
                    status : false,
                    message : "Verify your email address first"
                });
            }else{
                var mailOptions = smtpTransport.templateSender({
                    subject : "Password Forget Request for Apartment Complaints",
                    html : "<b>Hello <strong>{{username}}</strong>,your password for Apartment complaint is <span style=color:red;>{{password}}</span></b>"
                },{
                    from : "sqtesting2016@gmail.com"
                });
                mailOptions({
                    to : req.body.email
                },{
                    username : email.username,
                    password : email.password
                },function(err,email){
                    if(err){
                        res.json({
                            status: false,
                            message : "Error Occured" + err
                        });
                    }else{
                        res.json({
                            status : true,
                            message : "Password has been sent to your Registered E-mail address"
                        });
                    }
                });
            }
        }
    });
});



var apiRoutes = express.Router();

//User Login

apiRoutes.post('/login',function(req,res){
User.findOne({
    email : req.body.email
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
                }else if(user.confirm != true){
                    res.json({
                        status : false,
                        message  : "Wait for Secretary verification"
                    });
                }else{
                    var token = jwt.sign(user,app.get('superSecret'),{
                        expiresIn : "24h"
                    });

                    var id = user._id;
                    var admin = user.admin;
                    var username = user.username;
                    var houseno = user.houseno;
                    var blockno = user.blockno;
                    var apartment = user.apartment;
                    var floorno = user.floorno;

                    res.json({
                        status : true,
                        message : 'Logged in successfully!',
                        id : id,
                        sessiontoken : token,
                        admin : admin,
                        username : username,
                        houseno : houseno,
                        blockno : blockno,
                        apartment : apartment,
                        floorno : floorno
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
                status : true,
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
                status : true,
                message : "Application has been successfully removed"
            });
        }
    });
});

//Secretary Viewing Recent tickets

apiRoutes.post('/recenttickets',function(req,res){
    User.find({"raiseticket":{$elemMatch:{"ticketstatus":"pending"}}},{"apartment":1,"blockno":1,"floorno":1,"houseno":1,"username":1,"email":1,"phoneno":1,"raiseticket.$":1},
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

//Secretary Updating status on Recent ticket

apiRoutes.post('/recenttickets/update',function(req,res){
    var ticketstatus = req.body.ticketstatus;
    var comments = req.body.comments;
    User.findOneAndUpdate({"raiseticket.ticketid":req.body.ticketid},{$set:{"raiseticket.$.ticketstatus":ticketstatus,"raiseticket.$.comments":comments}},{safe:true,upsert:true,new:true},function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Try again"
            });
        }else{
            res.json({
                status : true,
                message : "Ticket status has been updated"
            });
        }
    });
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
   
    var ticket = "IRIS" + moment().format('YYMMMDDhmmss');

    complaintUpload(req,res,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            User.findByIdAndUpdate(query,{$push:{"raiseticket":{ticketid:ticket,complaint:req.body.complaint,description:req.body.description,imageurl:req.files}}},
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
                        ticketid : ticket,
                        message : "Your ticket has been added successfully",
                    });
                }
            }
            );
        }
    });
});


//User Viewing Own Tickets

apiRoutes.post('/resident/ticketstatus',function(req,res){
    var query = req.body.id;
    User.findOne({"_id":query},function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Try again"
            });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    });
});


//Password Change

apiRoutes.post('/password/change',function(req,res){
    User.findOne({password : req.body.oldpassword},function(err,info){
        if(err) throw err;

        if(info){
            User.update({"_id":req.body.id},{$set:{"password":req.body.newpassword}},{new:true},function(err,info1){
                if(err){
                    res.json({
                        status : false,
                        message : "Error Occured" + err
                    });
                }else{
                    res.json({
                        status : true,
                        message  : "Your Password has been Changed successfully"
                    });
                }
            });
        }
    });
});



app.use('/api',apiRoutes);


}