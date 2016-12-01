var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var multer = require('multer');
var mime = require('mime');
var moment = require('moment');
var nodemailer = require('nodemailer');
var cors = require('cors');
var request = require('request');

var Time = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm');

var User = require('./models/user');
var Train = require('./models/train');
var Coupon = require('./models/coupon');
var Auto = require('./models/auto');
var Restaurant = require('./models/restaurant')
var Retail = require('./models/retail')
var Revtrain = require('./models/revtrain');

//Post for Rent Image Storage

var rentstorage = multer.diskStorage({
    destination : function (req,file,cb){
        cb(null,'./public/rent');
    },
    filename: function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});


var rentupload = multer({
    storage : rentstorage
}).array('file',6);

//Licence Proof Storage

var licencestorage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/licence');
    },
    filename : function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});

var licenceupload = multer({
    storage : licencestorage
}).array('file',1);


//Post for Garage Storage

var garagestorage = multer.diskStorage({
    destination : function (req,file,cb){
        cb(null,'./public/garage');
    },
    filename: function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});


var garageupload = multer({
    storage : garagestorage
}).array('file',5);


//nodemailer

var smtpTransport = nodemailer.createTransport('smtps://mcitysq%40gmail.com:mcitysqindia@smtp.gmail.com')

module.exports = function(app){

//Uploading the Train Timings

app.post('/trainupload',function(req,res){
    Train.findOne({name:req.body.name},function(err,train){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            if(train){
                res.json({
                    status : false,
                    message  : "Train already exists"
                });
            }else{
                var trainModel = new Train();
                trainModel.name = req.body.name;
                trainModel.time = req.body.time;
                trainModel.sun = req.body.sun;
                trainModel.mon = req.body.mon;
                trainModel.tue = req.body.tue;
                trainModel.wed = req.body.wed;
                trainModel.thu = req.body.thu;
                trainModel.fri = req.body.fri;
                trainModel.sat = req.body.sat;
                trainModel.save(function(err,train){
                    train.save(function(err,train1){
                        res.json({
                            status : true,
                            message : "Train has been added successfully"
                        });
                    });
                });
            }
        }
    });
});

// Upload Coupons

app.post('/uploadcoupons',function(req,res){
    
    var coupon = new Coupon({
        shopname : req.headers['shopname'],
        code : req.headers['code'],
        expireddate : req.headers['expireddate'],
        description : req.headers['description']
    });

    coupon.save(function(err){
        if(err) throw err;

        res.json({
            status : true
        });
    });

});

// Upload Autos

app.post('/uploadauto',function(req,res){
    var auto = new Auto({
        pickuppoint : req.body.pickuppoint,
        droppoint : req.body.droppoint,
        rate : req.body.rate
    });

    auto.save(function(err){
        if(err) throw err;

        res.json({
            status : true
        });
    });
});

//Upload Restaurant

app.post('/uploadrestaurant',function(req,res){
    var restaurant = new Restaurant({
        restaurantname : req.headers['restaurantname'],
        address : req.headers['address'],
        openingtime : req.headers['openingtime'],
        mobileno : req.headers['mobileno'],
        description : req.headers['description']
    });

    restaurant.save(function(err){
        if(err) throw err;

        res.json({
            status : true
        });
    });
});

//Upload Retail

app.post('/uploadretail',function(req,res){
    var retail = new Retail({
        retailname : req.headers['retailname'],
        retaildescription : req.headers['retaildescription'],
        openingtime : req.headers['openingtime'],
        mobileno : req.headers['mobileno'],
        description : req.headers['description']
    });

    retail.save(function(err){
        if(err) throw err;

        res.json({
            status : true
        });
    });
});


//Retrieving the uploaded documents    

app.get('/rent/:name',function(req,res,next){
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

//Retrieving the Licence details

app.get('/licence/:name',function(req,res,next){
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


//Retrieving the Coupon Provider Logos

app.get('/coupons/:name',function(req,res,next){
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

//Retrieving the Restaurant details

app.get('/restaurant/:name',function(req,res,next){
    var options = {
        root : __dirname
    };
    var filename = req.params.name ;
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

//Retrieving the Retail details

app.get('/retail/:name',function(req,res,next){
    var options = {
        root : __dirname
    };
    var filename = req.params.name ;
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

//Retrieving the Garage Images    

app.get('/garage/:name',function(req,res,next){
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



//User Setup

app.get('/setup',function(req,res){

        var sq = new User({
            username : 'sqindia',
            mobileno : '12345678',
            email : 'sqindia@sqindia.net',
            password : 'password',
            admin : true
        });
        sq.save(function(err){
            if(err) throw err;

            console.log("User saved successfully");
            res.json({status : true});
        });

}); 

//cors

app.post('/',cors(),function(req,res,next){

    var name = req.body.driver_name ;
    var email = req.body.driver_email;

    res.json({
        status : "hello " + name + "your email is " + email 
    });
    console.log(req.body);
    console.log(name);
    console.log(email);
});

/*
//User Signing up

app.post('/signup',function(req,res){
    var password = Math.floor(Math.random()*90000)+10000;
    User.findOne({username:req.body.username,mobileno:req.body.mobileno,email:req.body.email},function(err,user){
        if(err){
            res.json({
                status: false,
                message: "Error Occured" + err
            });
        }else{
            if(user){
                res.json({
                    status: false,
                    message: "User already exists!"
                });
            }else{
                var mailOptions = smtpTransport.templateSender({
                    subject : "Password for mCity App",
                    html : "<b>Hello <strong>{{username}}</strong>, your One Time Password for mCity App is <span style=color:red;>{{password}}</span></b>"
                },{
                    from : "mcitysq@gmail.com"
                });
                mailOptions({
                    to : req.body.email
                },{
                    username : req.body.username,
                    password : password
                },function(err,email){
                    if(err){
                        res.json({
                            status : false,
                            message : "Error Occured" + err
                        });
                    }else{
                        var userModel = new User();
                        userModel.username = req.body.username;
                        userModel.mobileno = req.body.mobileno;
                        userModel.email = req.body.email;
                        userModel.password = password;
                        userModel.save(function(err,user){
                        var token = jwt.sign(user,app.get('superSecret'),{
                        expiresIn: "365 days"
                         });
                         user.save(function(err,user1){
                        res.json({
                            status: true,
                            message: 'You are successfully Registered and your OTP has been sent to your Email',
                            token: user1.token
                        });
                    });
                });
                    }
                });

                
            }
        }
    });
});


*/

// User Signing up without sendng OTP


app.post('/signup',function(req,res){
    var password = Math.floor(Math.random()*90000)+10000;
    User.findOne({username:req.body.username,mobileno:req.body.mobileno,email:req.body.email},function(err,user){
        if(err){
            res.json({
                status: false,
                message: "Error Occured" + err
            });
        }else{
            if(user){
                res.json({
                    status: false,
                    message: "User already exists!"
                });
            }else{
                var userModel = new User();
                        userModel.username = req.body.username;
                        userModel.mobileno = req.body.mobileno;
                        userModel.email = req.body.email;
                        userModel.save(function(err,user){
                        res.json({
                            status: true,
                            message: 'Thank You for Registering.Please Login'
                        });
                        });
                         
                     
                    
            }
        }
    });
});



// //OTP Generate Email

// app.post('/otpgenerate',function(req,res){
//     var password = Math.floor(Math.random()*90000)+10000;
//     User.findOne({email:req.body.email},function(err,user){
//         if(err){
//             res.json({
//                 status : false,
//                 message : "Error Occured" + err
//             });
//         }else if(!user){
//             res.json({
//                 status : false,
//                 message : "You have to Register first to get an OTP"
//             });
//         }else{
//                  var mailOptions = smtpTransport.templateSender({
//                 subject : "Password for mCity App",
//                 html : "<b>Hello <strong>{{username}}</strong>, your One Time Password for mCity App is <span style=color:red;>{{password}}</span></b>"
//             },{
//                 from : "mcitysq@gmail.com"
//             });
//             mailOptions({
//                 to : req.body.email
//             },{
//                 username : user.username,
//                 password : password
//             },function(err,email){
//                 if(err){
//                     res.json({
//                         status : false,
//                         message : "Error Occured" + err
//                     });
//                 }else{
//                     User.findOneAndUpdate({"email":req.body.email},{$set:{"password":password}},{safe:true,upsert:true,new:true},function(err,info){
//                         if(err){
//                             res.json({
//                                 status : false,
//                                 message : "Try again"
//                             });
//                         }else{
//                             res.json({
//                                 status : true,
//                                 message : "An Email with Passcode has been sent"
//                             });
//                         }
//                     });
//                 }
//             });
//         }
//     });
// });



//OTP Generate 2factor

app.post('/otpgenerate',function(req,res){
    
    
    User.findOne({mobileno:req.body.mobileno},function(err,user){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else if(!user){
            res.json({
                status : false,
                message : "You have to Register first to get an OTP"
            });
        }else{
                
             var password = Math.floor(Math.random()*9000)+1000;

             var mobileno = req.body.mobileno;
             var url = 'http://2factor.in/API/V1/2bc5bbd5-b23f-11e6-a40f-00163ef91450/SMS/' + '+91' + mobileno + '/' + password +'/mcity'
            
            var options = { method: 'GET',
                url : url,
            body: '{}' };

            request(options, function (error, response, body) {
            if (error) throw new Error(error);
            else{
                    User.findOneAndUpdate({"mobileno":req.body.mobileno},{$set:{"password":password}},{safe:true,upsert:true,new:true},function(err,info){
                        if(err){
                            res.json({
                                status : false,
                                message : "Try again"
                            });
                        }else{
                            res.json({
                                status : true,
                                message : "Please enter the OTP you received"
                            });
                        }
                    });
            }
            
    });

        }
    });
});




var apiRoutes = express.Router();



// // Email Login


// apiRoutes.post('/login',function(req,res){

//     User.findOne({
//         email : req.body.email 
//     },function(err,user){
//         if(err) throw err;

//         if(!user){
//             res.json({status:false,message:'Authentication failed.User not found'});
//         }else if(user){
//             if(user.password != req.body.password){
//                 res.json({status: false,message: 'Authentication failed.Wrong password'});
//             }else{
//                 var token = jwt.sign(user,app.get('superSecret'),{
//                     expiresIn: "365 days"
//                 });

//                var id = user._id;
//                var licence = user.licence;

//                 res.json({
//                     status: true,
//                     message: 'Logged in successfully!',
//                     id : id,
//                     token: token,
//                     licence : licence
//                    });
                
//          }
//          }
// });
// });



//Login 2factor


apiRoutes.post('/login',function(req,res){

    User.findOne({
        mobileno : req.body.mobileno 
    },function(err,user){
        if(err) throw err;

        if(!user){
            res.json({status:false,message:'Authentication failed.User not found'});
        }else if(user){
            if(user.password != req.body.password){
                res.json({status: false,message: 'Authentication failed.Wrong password'});
            }else{
                var token = jwt.sign(user,app.get('superSecret'),{
                    expiresIn: "365 days"
                });

               var id = user._id;
               var licence = user.licence;

                res.json({
                    status: true,
                    message: 'Logged in successfully!',
                    id : id,
                    token: token,
                    licence : licence
                   });
                
         }
         }
});
});


apiRoutes.use(function(req,res,next){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if(token){
        jwt.verify(token,app.get('superSecret'),function(err,decoded){
            if(err){
                return res.json({status: false,message: 'Failed to authenticate token'});
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


//Logout

apiRoutes.post('/logout',function(req,res){
    var query = req.headers['id'];
    User.findByIdAndUpdate(query,{$set:{"password":"null"}},
    {safe:true,upsert:true,new:true},
    function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status: true,
                message : "You have been successfully Logged Out"
            });
        }
    }
    );
});

//Post For Rent

apiRoutes.post('/postforrent',function(req,res){
    var query = req.headers['id'];
    var location = req.headers['location'];
    var landmark = req.headers['landmark'];
    var address = req.headers['address'];
    var city = req.headers['city'];
    var furnishedtype = req.headers['furnishedtype'];
    var bedroom = req.headers['bedroom'];
    var renttype = req.headers['renttype'];
    var monthlyrent = req.headers['monthlyrent'];
    var deposit = req.headers['deposit'];
    var description = req.headers['description'];
    var residential = req.headers['residential'];
    var phone = req.headers['phone'];
    rentupload(req,res,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{


            User.findByIdAndUpdate(query,{$push:{"postforrent":{$each:[{location : location,landmark : landmark,address: address,city : city,furnishedtype : furnishedtype,residential : residential, bedroom : bedroom,renttype : renttype,monthlyrent : monthlyrent,deposit : deposit,description : description,phone : phone,imageurl:req.files}],$position:0}}},
            {safe:true,upsert:true,new:true},
            function(err,info){
                if(err){
                    res.json({
                        status: false,
                        message : "Error Occured" + err
                    });
                }else{
                    res.json({
                        status : true,
                        message : "Your post has been added successfully"
                    });
                }
            }
          
           );
        }
    });
});


//Search For Rent

apiRoutes.post('/searchforrent1',function(req,res){
     var minvalue = req.body.minvalue;
     var maxvalue = req.body.maxvalue;
     User.find({"postforrent.bedroom":req.body.bedroom,"postforrent.location":req.body.location,"postforrent.residential":req.body.residential,"postforrent.furnishedtype":req.body.furnishedtype,"postforrent.monthlyrent":{$gt:minvalue,$lte:maxvalue}},{"username":1,"email":1,"mobileno":1,"postforrent.$":1},
     function(err,info){
         if(err){
             res.json({
                 status: false,
                 message: "Error Occured" + err
             });
             }else{
                 res.json({
                     status: true,
                     message: info
                 });
             }
         }
     
     )

});



//Search For Rent

apiRoutes.post('/searchforrent11',function(req,res){
     var minvalue = req.body.minvalue;
     var maxvalue = req.body.maxvalue;
     User.find({"postforrent.bedroom":req.body.bedroom,"postforrent.location":req.body.location,"postforrent.residential":req.body.residential,"postforrent.furnishedtype":req.body.furnishedtype,"postforrent.monthlyrent":{$gt:minvalue,$lte:maxvalue}},{"username":1,"email":1,"mobileno":1,"postforrent.$":1},
     function(err,info){
         if(err){
             res.json({
                 status: false,
                 message: "Error Occured" + err
             });
             }else{
                 res.json({
                     status: true,
                     message: info
                 });
             }
         }
     
     )

});





//Search For Rent

apiRoutes.post('/searchforrent111',function(req,res){
    var minvalue = req.body.minvalue;
    var maxvalue = req.body.maxvalue;

    var a = User.aggregate([
        {$match: {"postforrent.bedroom":req.body.bedroom,"postforrent.location":req.body.location,"postforrent.residential":req.body.residential,"postforrent.furnishedtype":req.body.furnishedtype} || {"postforrent.monthlyrent":{$gt:minvalue,$lte:maxvalue}}},
        {$unwind : "$postforrent"},
        {$match: {"postforrent.bedroom":req.body.bedroom,"postforrent.location":req.body.location,"postforrent.residential":req.body.residential,"postforrent.furnishedtype":req.body.furnishedtype} || {"postforrent.monthlyrent":{$gt:minvalue,$lte:maxvalue}}},
        {$project : {"username":1,"email":1,"mobileno":1,"postforrent":1}}
    ]);

    a.exec(function(err,info){
        if(err){
            res.json({
                status : false,
                message :"Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    });

});




//Search For Rent

apiRoutes.post('/searchforrent2',function(req,res){
     var minvalue = req.body.minvalue;
     var maxvalue = req.body.maxvalue;
     User.find({"postforrent":{$elemMatch:{$or:[{"bedroom":req.body.bedroom},{"location":req.body.location},{"residential":req.body.residential},{"furnishedtype":req.body.furnishedtype},{"monthlyrent":{$gt:minvalue,$lte:maxvalue}}]}}},{"username":1,"email":1,"mobileno":1,"postforrent.$":1},
     function(err,info){
         if(err){
             res.json({
                 status: false,
                 message: "Search not found" + err
             });
             }else{
                 res.json({
                     status: true,
                     message: info
                 });
             }
         }
     
     )

});



//Search For Rent

apiRoutes.post('/searchforrent',function(req,res){
    var minvalue = req.body.minvalue;
    var maxvalue = req.body.maxvalue;

    var a = User.aggregate([
        {$match: {"postforrent.bedroom":req.body.bedroom,"postforrent.location":req.body.location,"postforrent.residential":req.body.residential,"postforrent.furnishedtype":req.body.furnishedtype} || {"postforrent.monthlyrent":{$gt:minvalue,$lte:maxvalue}}},
        {$unwind : "$postforrent"},
        {$match: {"postforrent.bedroom":req.body.bedroom,"postforrent.location":req.body.location,"postforrent.residential":req.body.residential,"postforrent.furnishedtype":req.body.furnishedtype} || {"postforrent.monthlyrent":{$gt:minvalue,$lte:maxvalue}}},
        {$project : {"username":1,"email":1,"mobileno":1,"postforrent":1}}
    ]);

    a.exec(function(err,info){
        if(err){
            res.json({
                status : false,
                message :"Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    });

});

//User finding their own House

apiRoutes.post('/myrent',function(req,res){
    var query = req.body.id;
    User.findById(query,{"username":1,"email":1,"mobileno":1,"postforrent":1},
    function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    });
});

//User deleteing their own posts

apiRoutes.post('/removerent',function(req,res){
    var query1 = req.body.id1 ; 
    var query2 = req.body.id2 ;
    User.findByIdAndUpdate(query1,{$pull:{postforrent:{"_id":query2}}},
    function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : "Your Post has been removed successfully"
            });
        }
    });

});

//Post for Room

apiRoutes.post('/postforroom',function(req,res){
       var query = req.headers['id'];

       User.findByIdAndUpdate(query,{$push:{"postforroom":{$each:[{location:req.body.location,landmark:req.body.landmark,address:req.body.address,roomtype:req.body.roomtype,monthlyrent:req.body.monthlyrent,gender:req.body.gender,description:req.body.description,phone:req.body.phone}],$position : 0}}},
            {safe:true,upsert:true,new:true},
            function(err,info){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured" + err
                    });
                }else{
                    res.json({
                        status: true,
                        message: "Your Post has been added successfully"
                    });
                }
            }
       );
   });

//Search for Room

apiRoutes.post('/searchforroom',function(req,res){
    var minvalue = req.body.minvalue;
    var maxvalue = req.body.maxvalue;

    var a = User.aggregate([
        {$match : {"postforroom.location" : req.body.location,"postforroom.roomtype" : req.body.roomtype,"postforroom.gender" : req.body.gender} || {"postforrent.monthlyrent":{$gt:minvalue,$lte:maxvalue}}},
        {$unwind : "$postforroom"},
        {$match : {"postforroom.location" : req.body.location,"postforroom.roomtype" : req.body.roomtype,"postforroom.gender" : req.body.gender} || {"postforrent.monthlyrent":{$gt:minvalue,$lte:maxvalue}}},
        {$project : {"username":1,"email":1,"mobileno":1,"postforroom":1}}
    ]);

    a.exec(function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    });
});

/*
   //Search for room

   apiRoutes.post('/searchforroom',function(req,res){
       var minvalue = req.body.minvalue;
       var maxvalue = req.body.maxvalue;
       User.find({"postforroom":{$elemMatch:{"location":req.body.location,"roomtype":req.body.roomtype,"gender":req.body.gender,"monthlyrent":{$gt:minvalue,$lte:maxvalue}}}},{"username":1,"email":1,"mobileno":1,"postforroom.$":1},
       function(err,info){
           if(err){
               res.json({
                   status : false,
                   message : "Error Occured" + err
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
*/

//User finding their own room

apiRoutes.post('/myroom',function(req,res){
    var query = req.body.id;
    User.findById(query,{"username":1,"email":1,"mobileno":1,"postforroom":1},
    function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    });
});



//User removing their own room

apiRoutes.post('/removeroom',function(req,res){
    var query1 = req.body.id1 ;
    var query2 = req.body.id2 ;
    User.findByIdAndUpdate(query1,{$pull:{postforroom:{"_id":query2}}},
    function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : "Your Post has been removed successfully"
            });
        }
    });
});

//Searching All Rents

apiRoutes.post('/allrent',function(req,res){
  var a = User.find({"postforrent._id" : {$exists:true}} ,{"username":1,"email":1,"mobileno":1,"postforrent":1})

  a.exec(function(err,info){
      if(err){
          res.json({
              status : false,
              message : "Error Occured" + err
          });
      }else{
          res.json({
              status : true,
              message : info
          });
      }
  });
});

//Searching All Rooms

apiRoutes.post('/allroom',function(req,res){
  var a = User.find({"postforroom._id" : {$exists:true}} ,{"username":1,"email":1,"mobileno":1,"postforroom":1})

  a.exec(function(err,info){
      if(err){
          res.json({
              status : false,
              message : "Error Occured" + err
          });
      }else{
          res.json({
              status : true,
              message : info
          });
      }
  });
});


//Licence Upload
   
apiRoutes.post('/licenceupload',function(req,res){
    var query = req.headers['id'];
    licenceupload(req,res,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            User.findByIdAndUpdate(query,{$set:{"licence" : req.files}},
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
                        message : "Licence proof has been uploaded successfully.Wait for your Licence Verification",
                        licence : req.files[0].filename
                    });
                }
            });
        }
    });
});

//Post for Ride

apiRoutes.post('/postforride',function(req,res){
    var query = req.headers['id'];

     //   User.findByIdAndUpdate(query,{$push:{"raiseticket":{$each:[{ticketid:ticket,complaint:complaint,description:description,imageurl:req.files}],$position:0}}})

    User.findByIdAndUpdate(query,{$push:{"postforride":{$each:[{from:req.body.from,to:req.body.to,date:req.body.date,godate:req.body.godate,returndate:req.body.returndate,extraluggage:req.body.extraluggage,price:req.body.price,midwaydrop:req.body.midwaydrop,phone:req.body.phone}],$position : 0}}},
                {safe:true,upsert:true,new:true},
                function(err,info){
                if(err){
                    res.json({
                        status : false,
                    message : "Error Occured" + err
                });
                }else if(info.licenceverified != true){
                    res.json({
                        status : true,
                        message : "Your post has been added successfully.Wait for your Licence Verification"
                });
            
                }else{
                    res.json({
                        status : true,
                        message : "Your Post has been added successfully"
                    });
                }
                   
                });
});   


   
// Search for Ride

apiRoutes.post('/searchforride',function(req,res){
    var currenttime = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm');
      var a = User.aggregate([
        {$match: {"postforride.date" : {$gte : currenttime},"licenceverified" : true}},
        {$unwind : "$postforride"},
        {$match: {"postforride.date" : {$gte : currenttime},"licenceverified" : true}},
        {$project:{"postforride":1,"username":1,"email":1,"mobileno":1,"licence":1}}
    ]);

    a.exec(function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    });

});


/*
//Search for Ride from-to

apiRoutes.post('/searchforridefilter',function(req,res){
    var currenttime = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm');
    User.find({"postforride":{$elemMatch : {"from":req.body.from,"to":req.body.to,"date":{$gte:currenttime}}}},{"username":1,"email":1,"mobileno":1,"postforride.$":1,"licence":1},
    function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    }
    );
});
*/

//Search for Ride From-to

apiRoutes.post('/searchforridefilter',function(req,res){
    var currenttime = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm');
    var a = User.aggregate([
        {$match:{"postforride.from":req.body.from,"postforride.to":req.body.to,"postforride.date":{$gte:currenttime},"licenceverified" : true}},
        {$unwind: "$postforride"},
        {$match:{"postforride.from":req.body.from,"postforride.to":req.body.to,"postforride.date":{$gte:currenttime},"licenceverified" : true}},
        {$project:{"username":1,"email":1,"mobileno":1,"postforride":1,"licence":1}}
    ]);

    a.exec(function(err,info){
        if(err){
    res.json({
        status : false,
        message : "Error Occured" + err
    });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    });

});

//Advanced Search for Ride

apiRoutes.post('/advancedsearch',function(req,res){
    var minvalue = req.body.minvalue;
    var maxvalue = req.body.maxvalue;
    User.find({"postforride":{$elemMatch:{$or:[{"from":req.body.from} || {"to":req.body.to} || {"time":req.body.time} || {"godate":req.body.godate} || {"returndate":req.body.returndate}  || {"price":{$gt:minvalue,$lte:maxvalue}} || {"licenceverified" : true} || {"midwaydrop":req.body.midwaydrop} || {"extraluggage":req.body.extraluggage}]}}},{"username":1,"email":1,"mobileno":1,"postforride.$":1,"licence":1},
    function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    }
    );
});

// User seeing their own post

apiRoutes.post('/myrides',function(req,res){
    var query = req.body.id;
    User.findById(query,{"username":1,"email":1,"mobileno":1,"postforride":1},
    function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    });
});

//User removing their Own rides

apiRoutes.post('/removeride',function(req,res){
    var query1 = req.body.id1 ;
    var query2 = req.body.id2 ;
    User.findByIdAndUpdate(query1,{$pull:{postforride:{"_id":query2}}},
    function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : "Your Post has been removed successfully"
            });
        }
    }); 
});


//Post For Garage

apiRoutes.post('/postforgarage',function(req,res){
    var query = req.headers['id'];
    var adtitle = req.headers['adtitle'];
    var category = req.headers['category'];
    var price = req.headers['price'];
    var field1 = req.headers['field1'];
    var field2 = req.headers['field2'];
    var field3 = req.headers['field3'];
    var field4 = req.headers['field4'];
    var description = req.headers['description'];
    garageupload(req,res,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{


            User.findByIdAndUpdate(query,{$push:{"garage":{$each:[{adtitle : adtitle,category : category,price : price,field1 : field1,field2 : field2,field3 : field3, field4 : field4,imageurl:req.files}],$position:0}}},
            {safe:true,upsert:true,new:true},
            function(err,info){
                if(err){
                    res.json({
                        status: false,
                        message : "Error Occured" + err
                    });
                }else{
                    res.json({
                        status : true,
                        message : "Your ad has been added successfully"
                    });
                }
            }
          
           );
        }
    });
});


//Searching All Garage

apiRoutes.post('/allgarage',function(req,res){
  var a = User.find({"postforrent._id" : {$exists:true}} ,{"username":1,"email":1,"mobileno":1,"postforgarage":1})

  a.exec(function(err,info){
      if(err){
          res.json({
              status : false,
              message : "Error Occured" + err
          });
      }else{
          res.json({
              status : true,
              message : info
          });
      }
  });
});



// //Train Search

// apiRoutes.post('/trainsearch',function(req,res){ 
//     var time = req.body.departuretime;
//     var a = Train.find({"mon":"y","departuretime":{$gte:time}},{"name":1,"departuretime":1,"arrivaltime":1,"_id":0}).limit(6);
//     a.exec(function(err,info){
//         if(err){
//             res.json({
//                 status : false,
//                 message : "Error Occured" + err
//             });
//         }else{
//                 res.json({
//                     status : true,
//                     message : info
//                 });
//             }   
//     }
//     );
    
// });


//Train Search

apiRoutes.post('/trainsearch',function(req,res){ 
    var time = req.body.departuretime;
    var a = Train.find({"mon":"y","departuretime":{$gte:time}},{"name":1,"departuretime":1,"arrivaltime":1,"_id":0});
    a.exec(function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
                res.json({
                    status : true,
                    message : info
                });
            }   
    }
    );
    
});


// //Train Search on Sunday

// apiRoutes.post('/trainsearchsun',function(req,res){
//     var time = req.body.departuretime;
//     var a = Train.find({"sun":"y","departuretime":{$gte:time}},{"name":1,"departuretime":1,"arrivaltime":1,"_id":0}).limit(6); 
//     a.exec(function(err,info){
//         if(err){
//             res.json({
//                 status : false,
//                 message : "Error Occured" + err
//             });
//         }else{
//             res.json({
//                 status : true,
//                 message : info
//             })
//         }
//     })
// });


//Train Search on Sunday

apiRoutes.post('/trainsearchsun',function(req,res){
    var time = req.body.departuretime;
    var a = Train.find({"sun":"y","departuretime":{$gte:time}},{"name":1,"departuretime":1,"arrivaltime":1,"_id":0}); 
    a.exec(function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : info
            })
        }
    })
});


//Train Search Reverse

apiRoutes.post('/revtrainsearch',function(req,res){ 
    var time = req.body.departuretime;
    var a = Revtrain.find({"mon":"Y","departuretime":{$gte:time}},{"name":1,"departuretime":1,"arrivaltime":1,"_id":0});
    a.exec(function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
                res.json({
                    status : true,
                    message : info
                });
            }   
    }
    );
    
});


//Train Search on Sunday Reverse

apiRoutes.post('/revtrainsearchsun',function(req,res){
    var time = req.body.departuretime;
    var a = Revtrain.find({"sun":"Y","departuretime":{$gte:time}},{"name":1,"departuretime":1,"arrivaltime":1,"_id":0}); 
    a.exec(function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : info
            })
        }
    })
});

//Licence Verification

apiRoutes.post('/licenceverify',function(req,res){
    var query = req.body.id;
    User.findByIdAndUpdate(query,{$set:{licenceverified:true}},{new:true},function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : "Licence has been verified successfully"
            });
        }
        
    });
});

// Retrieve Coupons

apiRoutes.post('/getcoupons',function(req,res){
    var time = moment().add(5.5,'hours').format('YYYY-MM-DD');
    var a = Coupon.find({"expireddate":{$gte:time}},{"shopname":1,"code":1,"expireddate":1,"description":1,"logo":1,"_id":1});

    a.exec(function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    });

});

//Show Coupon

apiRoutes.post('/showcoupon',function(req,res){

    var couponid = req.body.couponid ;
    
    Coupon.findById(couponid,{"coupons":1},function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    });

});

/*

// Generate Coupons

apiRoutes.post('/generatecoupon',function(req,res){
    var random = Math.floor(Math.random()*900000)+100000;
    var code = "mc" + random ;

    var query1 = req.body.id1;
    var query2 = req.body.id2;

    Coupon.findByIdAndUpdate(query2,{$push:{"coupons":{code:code}}},{safe:true,upsert:true,new:true},function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            User.findByIdAndUpdate(query1,{$push:{"coupons":{code:code}}},{safe:true,upsert:true,new:true},function(err,info){
                if(err){
                    res.json({
                        status : false,
                        message : "Error Occured" + err
                    });
                }else{
                    res.json({
                        status : true,
                        code : code,
                        message : "You have Redeemed your coupon successfully"
                    });
                }
            });
        }
    });
        
});

*/

//Retrieve Autos

apiRoutes.post('/getautos',function(req,res){
    Auto.find({},{"pickuppoint":1,"droppoint":1,"rate":1},function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    });
});

// Retrieve Restaurant

apiRoutes.post('/getrestaurants',function(req,res){
    Restaurant.find({},{"restaurantname":1,"address":1,"openingtime":1,"logo":1,"viewmenu":1,"description":1,"mobileno":1},function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    });
})

// Retrieve Restaurant

apiRoutes.post('/getretails',function(req,res){
    Retail.find({},{"retailname":1,"retaildescription":1,"openingtime":1,"logo":1,"viewmenu":1,"description":1,"mobileno":1},function(err,info){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : info
            });
        }
    });
})


apiRoutes.get('/',function(req,res){
    res.json({message : 'Welcome to the coolest API on earth'});
});

apiRoutes.get('/users',function(req,res){
    User.find({},function(err,users){
        res.json(users);
    });
});





app.use('/api',apiRoutes);




};