var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var multer = require('multer');
var mime = require('mime');
var moment = require('moment');
var nodemailer = require('nodemailer');
var cors = require('cors');
var request = require('request');
var qs = require('qs');
var Time = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm');

var User = require('./models/user');
var Train = require('./models/train');
var Coupon = require('./models/coupon');
var Auto = require('./models/auto');
var Restaurant = require('./models/restaurant')
var Retail = require('./models/retail')
var Revtrain = require('./models/revtrain');
var Version = require('./models/version');
var Ceas = require('./models/ceas');
var Sell = require('./models/sell');

var Parche = require('./models/parche');
var Ride = require('./models/ride');

var Rent = require('./models/rent');
var Room = require('./models/room');

var Admin = require('./models/admin');

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
        cb(null,'C:/wamp64/www/mcity/assets/img/user_licence');
    },
    filename : function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});

var licenceupload = multer({
    storage : licencestorage
}).array('file',1);


//Post for Sell Storage

var sellstorage = multer.diskStorage({
    destination : function (req,file,cb){
        cb(null,'./public/sell');
    },
    filename: function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});


var sellupload = multer({
    storage : sellstorage
}).array('file',5);


//nodemailer

var smtpTransport = nodemailer.createTransport('smtps://mcitysq%40gmail.com:mcitysqindia@smtp.gmail.com')



module.exports = function(app){


var mcity = express.Router();




























mcity.post('/ownverify',function(req,res){
    
    var id = req.body.id;
    var mride = req.body.mride

    User.findByIdAndUpdate(id,{$set:{"mride":mride}},{safe:true,upsert:true,new:true},function(err,update){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: mride +"ed successfully"
            })
        }
    })

})



//Add Version

mcity.post('/addversion',function(req,res){
    Version.findOne({version : req.body.version},function(err,version){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{

            var versionModel = new Version();
            versionModel.version = req.body.version ;

            versionModel.save(function(err,save){
                res.json({
                   status : true,
                   message : "Version has been added successfully"
               }); 
           });
        }
    });
});


//Update Version

mcity.post('/updateversion',function(req,res){
    Version.findOneAndUpdate({version : req.body.oldversion},{$set:{"version":req.body.newversion}},{safe:true,upsert:true,new:true},function(err,version){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            res.json({
                status : true,
                message : "Version has been updated to " + req.body.newversion
            });
        }
    });
});


//Check Version

mcity.post('/checkversion',function(req,res){
    Version.findOne({version : req.body.version},function(err,version){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            if(version){
                res.json({
                    status : true
                });
            }else{
                res.json({
                    status :false
                });
            }
        }
    });
});





//Uploading the Train Timings

mcity.post('/trainupload',function(req,res){
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

mcity.post('/uploadcoupons',function(req,res){
    
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

mcity.post('/uploadauto',function(req,res){
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

mcity.post('/uploadrestaurant',function(req,res){
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

mcity.post('/uploadretail',function(req,res){
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

mcity.get('/rent/:name',function(req,res,next){
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

mcity.get('/user_licence/:name',function(req,res,next){
    var options = {
        //root : __dirname
        root: 'C:/wamp64/www/mcity/assets/img/user_licence'      //changed
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

mcity.get('/coupons/:name',function(req,res,next){
    var options = {
       // root : __dirname
       root: 'C:/wamp64/www/mcity/assets/img/shop_logo'  //changed
    };
    var filename = req.params.name;
    res.sendFile(filename,options,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
           console.log(filename + " has been sent"); 
        }
    });
});

//Retrieving the Restaurant details

mcity.get('/restaurant/:name',function(req,res,next){
    var options = {
     //   root : __dirname
     root: 'C:/wamp64/www/mcity/assets/img/shop_logo'  //changed
    };
    var filename = req.params.name ;
    res.sendFile(filename,options,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            console.log(filename + " has been sent"); 
        }
    });
});

//Retrieving the Retail details

mcity.get('/retail/:name',function(req,res,next){
    var options = {
       //   root : __dirname
     root: 'C:/wamp64/www/mcity/assets/img/shop_logo'  //changed
    };
    var filename = req.params.name ;
    res.sendFile(filename,options,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
           console.log(filename + " has been sent"); 
        }
    });
});

//Retrieving the Sell Images    

mcity.get('/sell/:name',function(req,res,next){
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



//Retrieving the Ads    

mcity.get('/ads/:name',function(req,res,next){
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


//Retrieving shop

mcity.get('/shop_logo/:name',function(req,res){
    var options = {
        root: 'C:/wamp64/www/mcity/assets/img/shop_logo'
    };

    var filename = req.params.name;
    res.sendFile(filename,options,function(err){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            console.log(filename + " has been sent");
        }
    })
})


//Retrieving shop

mcity.get('/menu/:name',function(req,res){
    var options = {
        root: 'C:/wamp64/www/mcity/assets/img/menu_images'
    };

    var filename = req.params.name;
    res.sendFile(filename,options,function(err){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
          console.log(filename + " has been sent")
        }
    })
})


//User Setup

mcity.get('/setup',function(req,res){

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

mcity.post('/',cors(),function(req,res,next){

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


mcity.post('/signup',function(req,res){
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

mcity.post('/otpgenerate',function(req,res){
    
    
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


app.use('/mcity',mcity);


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
           //    var licence = user.licence;
               var mride = user.mride;

                res.json({
                    status: true,
                    message: 'Logged in successfully!',
                    id : id,
                    token: token,
             //       licence : licence,
                    mride : mride
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


//Post For Rent - NEW 

apiRoutes.post('/postforrentnew',function(req,res){

    var id = req.headers['id'];
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
                status: false,
                message: "Error Occured " + err
            })
        }else{

    User.findById(id,{mobileno:1},function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

                var mobile = info.mobileno;

                var rentModel = new Rent();

                rentModel.mobileno = mobile;
                rentModel.location = location;
                rentModel.landmark = landmark;
                rentModel.address = address;
                rentModel.city = city;
                rentModel.furnishedtype = furnishedtype;
                rentModel.bedroom = bedroom;
                rentModel.renttype = renttype;
                rentModel.monthlyrent = monthlyrent;
                rentModel.deposit = deposit;
                rentModel.description = description;
                rentModel.residential = residential;
                rentModel.phone = phone;
                rentModel.imageurl = req.files || "null"

                rentModel.save(function(err,rent){
                    if(err){
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        })
                    }else{
                         res.json({
                            status: true,
                            message: "Your Post has been added successfully"
                        })
                    }
                   
                })

        }
    })

        }
    })

})


/*

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
     User.find({"postforrent":[{"bedroom":req.body.bedroom} || {"location":req.body.location} || {"residential":req.body.residential}|| {"furnishedtype":req.body.furnishedtype}]},{"username":1,"email":1,"mobileno":1,"postforrent.$":1},
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

apiRoutes.post('/searchforrent111',function(req,res){
    var minvalue = req.body.minvalue;
    var maxvalue = req.body.maxvalue;

    var a = User.aggregate([
        {$match: {"postforrent.location":req.body.location,"postforrent.bedroom":req.body.bedroom,"postforrent.residential":req.body.residential,"postforrent.furnishedtype":req.body.furnishedtype} || {"postforrent.monthlyrent":{$gt:minvalue,$lte:maxvalue}}},
        {$unwind : "$postforrent"},
       {$match: {"postforrent.location":req.body.location,"postforrent.bedroom":req.body.bedroom,"postforrent.residential":req.body.residential,"postforrent.furnishedtype":req.body.furnishedtype} || {"postforrent.monthlyrent":{$gt:minvalue,$lte:maxvalue}}},
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
     User.find({"postforrent":{$elemMatch:{$or:[{"bedroom":req.body.bedroom},{"location":req.body.location},{"residential":req.body.residential},{"furnishedtype":req.body.furnishedtype}]}}},{"username":1,"email":1,"mobileno":1,"postforrent.$":1},
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


*/


//Search For Rent

apiRoutes.post('/searchforrent',function(req,res){
    var minvalue = req.body.minvalue;
    var maxvalue = req.body.maxvalue;
  
//Req.body length

              var a = [];
              function Count(){
                 for (var number in req.body){
                    a.push(number);
                }
                   return a ;
                }

              Count();

            var query = a.length ;
    
    function Search(){

           
        
        if(query == 1){
            var first = User.aggregate([
                {$match:{$or: [{$and:[{"postforrent.location":req.body.location}]}]}},
                {$unwind : "$postforrent"},
                {$match:{$or: [{$and:[{"postforrent.location":req.body.location}]}]}},
                {$project : {"username":1,"email":1,"mobileno":1,"postforrent":1}}
            ]) ;

        first.exec(function(err,info){
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
        
        }else if(query == 2){
            var second = User.aggregate([
                {$match:{$or: [{$and:[{"postforrent.location":req.body.location},{"postforrent.residential":req.body.residential}]}]}},
                {$unwind : "$postforrent"},
                {$match:{$or: [{$and:[{"postforrent.location":req.body.location},{"postforrent.residential":req.body.residential}]}]}},
                {$project : {"username":1,"email":1,"mobileno":1,"postforrent":1}}
            ]);
        
        
        second.exec(function(err,info){
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
        }else if(query == 3){
            var third = User.aggregate([
                {$match:{$or: [{$and:[{"postforrent.location":req.body.location},{"postforrent.bedroom":req.body.bedroom},{"postforrent.residential":req.body.residential}]}]}},
                {$unwind : "$postforrent"},
                {$match:{$or: [{$and:[{"postforrent.location":req.body.location},{"postforrent.bedroom":req.body.bedroom},{"postforrent.residential":req.body.residential}]}]}},
                {$project : {"username":1,"email":1,"mobileno":1,"postforrent":1}}
            ]);
        
          
        third.exec(function(err,info){
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
        }else if(query == 4){
            var four = User.aggregate([
                {$match:{$or: [{$and:[{"postforrent.location":req.body.location},{"postforrent.bedroom":req.body.bedroom},{"postforrent.residential":req.body.residential},{"postforrent.furnishedtype":req.body.furnishedtype}]}]}},
                {$unwind : "$postforrent"},
                {$match:{$or: [{$and:[{"postforrent.location":req.body.location},{"postforrent.bedroom":req.body.bedroom},{"postforrent.residential":req.body.residential},{"postforrent.furnishedtype":req.body.furnishedtype}]}]}},
                {$project : {"username":1,"email":1,"mobileno":1,"postforrent":1}}
            ]);

        four.exec(function(err,info){
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

        }
    }
Search();
  

});



//Search For Rent - NEW


apiRoutes.post('/searchforrentnew',function(req,res){

    var location = req.body.location;
    var bedroom = req.body.bedroom;
    var residential = req.body.residential;
    var furnishedtype = req.body.furnishedtype;

    
    var obj = req.body;
      

          var a = [];

          function filter(o){

                this.location = location;
                this.bedroom = bedroom;
                this.residential = residential;
                this.furnishedtype = furnishedtype;


                if(this.location && this.bedroom && this.residential && this.furnishedtype){
                     a.push([{"location":location,"bedroom":bedroom,"residential":residential,"furnishedtype":furnishedtype}])
                }else if(this.bedroom && this.residential && this.furnishedtype){
                     a.push([{"bedroom":bedroom,"residential":residential,"furnishedtype":furnishedtype}])
                }else if(this.location && this.residential && this.furnishedtype){
                     a.push([{"location":location,"residential":residential,"furnishedtype":furnishedtype}])
                }else if(this.location && this.bedroom && this.furnishedtype){
                     a.push([{"location":location},{"bedroom":bedroom},{"furnishedtype":furnishedtype}])
                }else if(this.location && this.bedroom && this.residential){
                     a.push([{"location":location},{"bedroom":bedroom},{"residential":residential}])
                }else if(this.residential && this.furnishedtype){
                     a.push([{"residential":residential},{"furnishedtype":furnishedtype}])
                }else if(this.bedroom && this.furnishedtype){
                     a.push([{"bedroom":bedroom,"furnishedtype":furnishedtype}])
                }else if(this.bedroom && this.residential){
                     a.push([{"bedroom":bedroom,"residential":residential}])
                }else if(this.location && this.furnishedtype){
                     a.push([{"location":location,"furnishedtype":furnishedtype}])
                }else if(this.location && this.residential){
                     a.push([{"location":location,"residential":residential}])
                }else if(this.location && this.bedroom){
                     a.push([{"location":location,"bedroom":bedroom}])
                }else if(this.furnishedtype){
                     a.push([{"furnishedtype":furnishedtype}])
                }else if(this.residential){
                     a.push([{"residential":residential}])
                }else if(this.bedroom){
                     a.push([{"bedroom":bedroom}])
                }else if(this.location){
                     a.push([{"location":location}])
                }


          }


          filter(obj);
  

    Rent.aggregate([
        {$match:
           {$and: 
                a[0]
            } 
           
        },
        {$lookup:
        {
            from: "users",
            localField: "mobileno",
            foreignField: "mobileno",
            as: "userdetails"
        }},
        {$project: {"mobileno":1,"location":1,"landmark":1,"address":1,"city":1,"furnishedtype":1,"bedroom":1,"renttype":1,"monthlyrent":1,"deposit":1,"description":1,"residential":1,"phone":1,"imageurl":1,"userdetails.email":1,"userdetails.username":1}},
        {$sort: {"_id": -1}}
    ]).exec(function(err,rent){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: rent
            })
        }
    })
})






/*

//Search For Rent Loc

apiRoutes.post('/searchforrentloc',function(req,res){
    var minvalue = req.body.minvalue;
    var maxvalue = req.body.maxvalue;

    var a = User.aggregate([
        {$match: {"postforrent.location":req.body.location}},
        {$unwind : "$postforrent"},
        {$match: {"postforrent.location":req.body.location}},
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


*/


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

//Searching all rent - NEW 

apiRoutes.post('/allrentnew',function(req,res){

    Rent.aggregate([
        {$lookup:
        {
            from: "users",
            localField: "mobileno",
            foreignField: "mobileno",
            as: "userdetails"
        }},
        {$project: {"mobileno":1,"location":1,"landmark":1,"address":1,"city":1,"furnishedtype":1,"bedroom":1,"renttype":1,"monthlyrent":1,"deposit":1,"description":1,"residential":1,"phone":1,"imageurl":1,"userdetails.email":1,"userdetails.username":1}},
        {$sort: {"_id": -1}}
    ]).exec(function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: info
            })
        }
    })


})

//User finding their own House

apiRoutes.post('/myrent',function(req,res){
    var query = req.body.id;
    User.findById(query,{"username":1,"email":1,"mobileno":1,"postforrent":1},function(err,info){
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


//User finding their own House - NEW 

apiRoutes.post('/myrentnew',function(req,res){

    var id = req.headers['id'];

    User.findById(id,{"mobileno":1},function(err,mobile){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            var mobileno = mobile.mobileno;

            Rent.find({"mobileno": mobileno}).sort({_id:-1}).exec(function(err,rent){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                    res.json({
                        status: true,
                        message: rent
                    })
                }
            })
        }
    })
})


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


//User deleteing their own posts - NEW

apiRoutes.post('/removerentnew',function(req,res){

    var id = req.headers['id'];
    var query = req.body.id2;

    Rent.findByIdAndRemove(query,function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: "Your post has been removed successfully"
            })
        }
    })
})


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


//Post for Room - NEW 

apiRoutes.post('/postforroomnew',function(req,res){

    var id = req.headers['id'];

    var location = req.body.location;
    var landmark = req.body.landmark;
    var address = req.body.address;
    var roomtype = req.body.roomtype;
    var monthlyrent = req.body.monthlyrent;
    var gender = req.body.gender;
    var description = req.body.description;
    var phone = req.body.phone;


    User.findById(id,{mobileno:1},function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            
            var mobile = info.mobileno;

            var roomModel = new Room();

            roomModel.mobileno = mobile;
            roomModel.location = location;
            roomModel.landmark = landmark;
            roomModel.address = address;
            roomModel.roomtype = roomtype;
            roomModel.monthlyrent = monthlyrent;
            roomModel.gender = gender;
            roomModel.description = description;
            roomModel.phone = phone;

            roomModel.save(function(err,save){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                    res.json({
                        status: true,
                        message: "Your post has been added successfully"
                    })
                }
            })


        }
    })


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


//Search for room - NEW

apiRoutes.post('/searchforroomnew',function(req,res){

    var location = req.body.location;
    var roomtype = req.body.roomtype;
    var gender = req.body.gender;

    var minvalue = Number(req.body.minvalue);
    var maxvalue = Number(req.body.maxvalue);


    var obj = req.body;

    var arr = [];

    function filter(o){

        this.location = location;
        this.roomtype = roomtype;
        this.gender = gender;

        this.minvalue = minvalue;
        this.maxvalue = maxvalue;




         if(this.location && this.roomtype && this.gender && this.minvalue && this.maxvalue){
                     arr.push([{"location":location,"roomtype":roomtype,"gender":gender,"monthlyrent":{$gt:minvalue,$lte:maxvalue}}])
                }else if(this.roomtype && this.gender && this.minvalue && this.maxvalue){
                     arr.push([{"roomtype":roomtype,"gender":gender,"monthlyrent":{$gt:minvalue,$lte:maxvalue}}])
                }else if(this.location && this.gender && this.minvalue && this.maxvalue){
                     arr.push([{"location":location,"gender":gender,"monthlyrent":{$gt:minvalue,$lte:maxvalue}}])
                }else if(this.location && this.roomtype && this.minvalue && this.maxvalue){
                     arr.push([{"location":location},{"roomtype":roomtype},{"monthlyrent":{$gt:minvalue,$lte:maxvalue}}])
                }else if(this.location && this.roomtype && this.gender){
                     arr.push([{"location":location},{"roomtype":roomtype},{"gender":gender}])
                }else if(this.gender && this.minvalue && this.maxvalue){
                     arr.push([{"gender":gender},{"monthlyrent":{$gt:minvalue,$lte:maxvalue}}])
                }else if(this.roomtype && this.minvalue && this.maxvalue){
                     arr.push([{"roomtype":roomtype,"monthlyrent":{$gt:minvalue,$lte:maxvalue}}])
                }else if(this.roomtype && this.gender){
                     arr.push([{"roomtype":roomtype,"gender":gender}])
                }else if(this.location && this.minvalue && this.maxvalue){
                     arr.push([{"location":location,"monthlyrent":{$gt:minvalue,$lte:maxvalue}}])
                }else if(this.location && this.gender){
                     arr.push([{"location":location,"gender":gender}])
                }else if(this.location && this.roomtype){
                     arr.push([{"location":location,"roomtype":roomtype}])
                }else if(this.minvalue && this.maxvalue){
                     arr.push([{"monthlyrent":{$gt:minvalue,$lte:maxvalue}}])
                }else if(this.gender){
                     arr.push([{"gender":gender}])
                }else if(this.roomtype){
                     arr.push([{"roomtype":roomtype}])
                }else if(this.location){
                     arr.push([{"location":location}])
                }

    }


    filter(obj);

    Room.aggregate([
        {$match:
            {$and:
                arr[0]
            }
        },
        {$lookup:
        {
            from: "users",
            localField: "mobileno",
            foreignField: "mobileno",
            as: "userdetails"
        }},
        {$project: {"mobileno":1,"location":1,"roomtype":1,"gender":1,"phone":1,"landmark":1,"userdetails.email":1,"userdetails.username":1,"landmark":1,"description":1,"monthlyrent":1}},
        {$sort: {"_id": -1}}
    ]).exec(function(err,room){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: room
            })
        }
    })


})





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
    User.findById(query,{"username":1,"email":1,"mobileno":1,"postforroom":1},function(err,info){
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


//User finding their own room - NEW 

apiRoutes.post('/myroomnew',function(req,res){

    var id = req.headers['id'];

    User.findById(id,{"mobileno":1},function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            
                var mobileno = info.mobileno;

                Room.find({"mobileno":mobileno}).sort({_id: -1}).exec(function(err,room){
                    if(err){
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        })
                    }else{
                        res.json({
                            status: true,
                            message: room
                        })
                    }
                })
        }
    })
})


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


//User Removing their own room - NEW

apiRoutes.post('/removeroomnew',function(req,res){
    
    var id = req.headers['id'];
    var query = req.body.id2;

    Room.findByIdAndRemove(query,function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: "Your post has been removed successfully"
            })
        }
    })

})

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


//Searching all rooms - NEW 

apiRoutes.post('/allroomnew',function(req,res){

    Room.aggregate([
        {$lookup:
        {
            from: "users",
            localField: "mobileno",
            foreignField: "mobileno",
            as: "userdetails"
        }},
        {$project: {"mobileno":1,"location":1,"landmark":1,"address":1,"roomtype":1,"monthlyrent":1,"gender":1,"description":1,"phone":1,"userdetails.email":1,"userdetails.username":1}},
        {$sort: {"_id": -1}}
    ]).exec(function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: info
            })
        }
    })
})

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


//

apiRoutes.post('/mrideverify',function(req,res){
    
    var id = req.headers['id'];

    User.findById(id,{"mride":1},function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: info
            })
        }
    })

})


//Post for Ride

apiRoutes.post('/postforride',function(req,res){
    var query = req.headers['id'];

     //   User.findByIdAndUpdate(query,{$push:{"raiseticket":{$each:[{ticketid:ticket,complaint:complaint,description:description,imageurl:req.files}],$position:0}}})

    User.findByIdAndUpdate(query,{$push:{"postforride":{$each:[{from:req.body.from,to:req.body.to,date:req.body.date,godate:req.body.godate,returndate:req.body.returndate,noofpersons:req.body.noofpersons,price:req.body.price,midwaydrop:req.body.midwaydrop,phone:req.body.phone}],$position : 0}}},
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



//Post for Ride

apiRoutes.post('/postforridenew',function(req,res){

    var id = req.headers['id'];

    var from = req.body.from;
    var to = req.body.to;
    var date = req.body.date;
    var godate = req.body.godate;
    var returndate = req.body.returndate;
    var noofpersons = req.body.noofpersons;
    var price = req.body.price;
    var midwaydrop = req.body.midwaydrop;
    var phone = req.body.phone;

    User.findById(id,{mobileno:1,licenceverified:1},function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            });
        }else{

            var mobile = info.mobileno;
            var licence = info.licenceverified;

            var rideModel = new Ride();

                rideModel.mobileno = mobile;
                rideModel.from = from;
                rideModel.to = to;
                rideModel.date = date;
                rideModel.otherdetails.roundtrip.godate = godate;
                rideModel.otherdetails.roundtrip.returndate = returndate;
                rideModel.otherdetails.noofpersons = noofpersons;
                rideModel.price = price;
                rideModel.midwaydrop = midwaydrop;
                rideModel.phone = phone;

                rideModel.save(function(err,ride){
                    if(err){
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        });
                    }else if(licence != true){
                        res.json({
                            status: true,
                            message: "Your post has been added successfully.Wait for your Licence Verification"
                        });
                    }else{
                        res.json({
                            status: true,
                            message: "Your Post has beeb added successfully"
                        })
                    }
                });
        }
    })

})




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




//Searchforridenew

apiRoutes.post('/searchforridenew',function(req,res){

    var currenttime = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm')

    var a = Ride.aggregate([
        {$match: {"date":{$gte:currenttime}}},
        {$lookup:
        {
            from: "users",
            localField: "mobileno",
            foreignField: "mobileno",
            as: "userdetails"
        }},
        {$project: {"mobileno":1,"from":1,"to":1,"date":1,"otherdetails":1,"price":1,"midwaydrop":1,"phone":1,"userdetails.email":1,"userdetails.username":1,"userdetails.licence":1}},
        {$sort: {"_id":-1}}
    ]);

    a.exec(function(err,ride){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: ride
            })
        }
    })
})

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


//Search Ride Filter new

apiRoutes.post('/searchforridefilternew',function(req,res){
    var currenttime = moment().add(5.5,'hours').format('YYYY/MM/DD T h:,mm');

    var from = req.body.from;
    var to = req.body.to;

    Ride.aggregate([
        {$match: {"from":from,"to":to,"date":{$gte:currenttime}}},
        {$lookup:
        {
            from: "users",
            localField: "mobileno",
            foreignField: "mobileno",
            as: "userdetails"
        }},
        {$project: {"mobileno":1,"from":1,"to":1,"date":1,"otherdetails":1,"price":1,"midwaydrop":1,"phone":1,"userdetails.email":1,"userdetails.username":1,"userdetails.licence":1}},
        {$sort: {"_id":-1}}
    ]).exec(function(err,ride){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            });
        }else{
            res.json({
                status: true,
                message: ride
            })
        }
    })
})



//Advanced Search for Ride

apiRoutes.post('/advancedsearch',function(req,res){
    var minvalue = req.body.minvalue;
    var maxvalue = req.body.maxvalue;
    User.find({"postforride":{$elemMatch:{$or:[{"from":req.body.from} || {"to":req.body.to} || {"time":req.body.time} || {"godate":req.body.godate} || {"returndate":req.body.returndate}  || {"price":{$gt:minvalue,$lte:maxvalue}} || {"licenceverified" : true} || {"midwaydrop":req.body.midwaydrop} || {"noofpersons":req.body.noofpersons}]}}},{"username":1,"email":1,"mobileno":1,"postforride.$":1,"licence":1},
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
    User.findById(query,{"username":1,"email":1,"mobileno":1,"postforride":1},function(err,info){
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

//User seeing their own post new

apiRoutes.post('/myridesnew',function(req,res){

    var id = req.headers['id'];

    User.findById(id,{"mobileno":1},function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            var mobile = info.mobileno;

            Ride.find({"mobileno":mobile}).sort({_id:-1}).exec(function(err,ride){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    });
                }else{
                    res.json({
                        status: true,
                        message: ride
                    })
                }
            })

        }
    })

})

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



//User removing their ride

apiRoutes.post('/removeridenew',function(req,res){

    var id = req.headers['id'];
    var query = req.body.id2;

    Ride.findByIdAndRemove(query,function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: "Your post has been removed succesfully"
            })
        }
    })
})


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
    var phone = req.headers['phone'];
    var description = req.headers['description'];
    garageupload(req,res,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{


            User.findByIdAndUpdate(query,{$push:{"garage":{$each:[{adtitle : adtitle,category : category,price : price,field1 : field1,field2 : field2,field3 : field3, field4 : field4,phone : phone,description : description,imageurl:req.files}],$position:0}}},
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


//Post For Garage

apiRoutes.post('/postforsell',function(req,res){
    
    var id = req.headers['id'];
    var adtitle = req.headers['adtitle'];
    var category = req.headers['category'];
    var price = req.headers['price'];
    var field1 = req.headers['field1'];
    var field2 = req.headers['field2'];
    var field3 = req.headers['field3'];
    var field4 = req.headers['field4'];
    var phone = req.headers['phone'];
    var description = req.headers['description'];
    
    sellupload(req,res,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{

            User.findById(id,{mobileno:1},function(err,mobile){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured" + err
                    });
                }else{

                    var mobile = mobile.mobileno;

                    var sellModel = new Sell();

                        sellModel.mobileno = mobile;
                        sellModel.adtitle = adtitle;
                        sellModel.category = category;
                        sellModel.price = price;
                        sellModel.field1 = field1;
                        sellModel.field2 = field2;
                        sellModel.field3 = field3;
                        sellModel.field4 = field4;
                        sellModel.description = description;
                        sellModel.phone = phone;
                        sellModel.imageurl = req.files || "null";

                        sellModel.save(function(err,sell){
                            res.json({
                                status: true,
                                message: "Your ad has been posted successfully"
                            });
                        });
                }
            });


        }
    });
});


//Search for Sell based on category


apiRoutes.post('/searchforsell',function(req,res){

    var a = Sell.aggregate([
        {$match: {"category": req.body.category}},
        {$lookup:
            {
                from: "users",
                localField: "mobileno",
                foreignField: "mobileno",
                as: "userdetails"
            }},
        {$project: {"mobileno":1,"adtitle":1,"category":1,"price":1,"field1":1,"field2":1,"field3":1,"field4":1,"description":1,"phone":1,"imageurl":1,"postedon":1,"userdetails.email":1,"userdetails.username":1}},
        {$sort: {"_id": -1}}
    ])

    a.exec(function(err,sell){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            });
        }else{
            res.json({
                status: true,
                message: sell
            })
        }
    })

})




//Searching All Garage

apiRoutes.post('/allgarage',function(req,res){
  var a = User.find({"garage._id" : {$exists:true}} ,{"username":1,"email":1,"mobileno":1,"garage":1})

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



//Searching All Sells

apiRoutes.post('/allsell',function(req,res){
    
    var a = Sell.aggregate([
        {$lookup:
                {
                from: "users",
                localField: "mobileno",
                foreignField: "mobileno",
                as: "userdetails"       
        }},
        {$project: {"mobileno":1,"adtitle":1,"category":1,"price":1,"field1":1,"field2":1,"field3":1,"field4":1,"description":1,"phone":1,"imageurl":1,"postedon":1,"userdetails.email":1,"userdetails.username":1}},
        {$sort: {"_id": -1}}  
    ]);

    a.exec(function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured" + err
            })
        }else{
            res.json({
                status: true,
                message: info
            })
        }
    })


});



//User finding their own Garage

apiRoutes.post('/mygarage',function(req,res){
    var query = req.body.id;
    User.findById(query,{"username":1,"email":1,"mobileno":1,"garage":1},function(err,info){
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




//User finding their own Sells

apiRoutes.post('/mysell',function(req,res){
    
    var id = req.headers['id'];

    User.findById(id,{"mobileno":1},function(err,mobile){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            });
        }else{

                var mobileno = mobile.mobileno;


                Sell.find({"mobileno": mobileno}).sort({_id:-1}).exec(function(err,sell){
                    if(err){
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        });
                    }else{
                        res.json({
                            status: true,
                            message: sell
                        })
                    }
                })
        }
    }) 



});



//User Removing their own sell

apiRoutes.post('/removesell',function(req,res){
    var id = req.headers['id'];
    var query = req.body.id2;
    
    Sell.findByIdAndRemove(query,function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: "Your ad has been removed"
            })
        }
    })

})


//User Updating their own sell


apiRoutes.post('/updatesell',function(req,res){
    var id = req.headers['id'];
    var query = req.body.id2;

    var adtitle = req.body.adtitle;
    var category = req.body.category;
    var price = req.body.price;
    var field1 = req.body.field1;
    var field2 = req.body.field2;
    var field3 = req.body.field3;
    var field4 = req.body.field4;
    var phone = req.body.phone;
    var description = req.body.description;

    Sell.findByIdAndUpdate(query,{$set:{adtitle:adtitle,category:category,price:price,field1:field1,field2:field2,field3:field3,field4:field4,phone:phone,description:description}},{safe:true,upsert:true,new:true},function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            });
        }else{
            res.json({
                status: true,
                message: "Your Post has been updated successfully"
            })
        }
    })

})



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





// Parche Search

apiRoutes.post('/parche',function(req,res){
    var time = req.body.departuretime;

   Parche.find({"mon":"Y","departuretime":{$gte:time}},{"name":1,"departuretime":1,"arrivaltime":1,"_id":0}).exec(function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: info
            })
        }
    })

})



//Parche Sunday

apiRoutes.post('/parchesun',function(req,res){
    var time = req.body.departuretime;

   Parche.find({"sun":"Y","departuretime":{$gte:time}},{"name":1,"departuretime":1,"arrivaltime":1,"_id":0}).exec(function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            });
        }else{
            res.json({
                status: true,
                message: info
            })
        }
    })
})



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



//Get Coupons - NEW 


apiRoutes.post('/getcouponsnew',function(req,res){
     var time = moment().add(5.5,'hours').format('YYYY/MM/DD')

      
        Coupon.aggregate([
        {$match: {"coupon_expiry_date": {$gte: time}}},
        {$lookup:
        {
            from: "admins",
            localField: "shop_id",
            foreignField: "demo_shop_id",
            as: "shopdetails"
        }},
        {$project: {"coupon_code":1,"coupon_name":1,"coupon_desc":1,"coupon_expiry_date":1,"shopdetails.shop_name":1,"shopdetails.shop_logo":1}}
    ]).exec(function(err,coupon){
        if(err){
            res.json({
                status: false,
                message: "Error Occcured " + err
            })
        }else{
            res.json({
                status: true,
                message: coupon
            })
        }
    })
  

})



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


//Show Coupons from Shops 


apiRoutes.post('/showcouponsfromshop',function(req,res){

    var id = req.body.demo_shop_id;

    var time = moment().add(5.5,'hours').format('YYYY/MM/DD')

    Coupon.aggregate([
        {$match: {"shop_id":id,"coupon_expiry_date":{$gte: time}}},
        {$lookup:
        {
            from: "admins",
            localField: "shop_id",
            foreignField: "demo_shop_id",
            as: "shopdetails"
        }},
        {$project: {"coupon_code":1,"coupon_name":1,"coupon_desc":1,"coupon_expiry_date":1,"shopdetails.shop_name":1,"shopdetails.shop_logo":1}}
    ]).exec(function(err,coupon){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: coupon
            })
        }
    })

   
})


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


// Retrieve Restaurant - NEW 

apiRoutes.post('/getrestaurantsnew',function(req,res){

    Admin.find({"shop_category":"Restaurants"},function(err,restaurant){
        if(err){
            res.json({
                status: false,
                message: "Error Occcured " + err
            })
        }else{
            res.json({
                status: true,
                message: restaurant
            })
        }
    })
})



// Retrieve Retails

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


// Retrieve Retails - NEW

apiRoutes.post('/getretailsnew',function(req,res){

    Admin.find({"shop_category":"Retail Shopping"},function(err,retail){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: retail
            })
        }
    })
})

// Receiving ceas notification

apiRoutes.post('/updateceas',function(req,res){
    var id = req.headers['id'];
    var getnotify = req.body.getnotify;
    var volunteer = req.body.volunteer;

    User.findById(id,{mobileno:1},function(err,mobile){
        if(err){
            res.json({
                status: false,
                message: "Error Occured" + err
            });
        }else{
            
            var mobile =  mobile.mobileno;

    Ceas.findOneAndUpdate({mobileno: mobile},{$set:{"getnotify":getnotify,"volunteer":volunteer}},{safe:true,upsert:true,new:true},function(err,ceas){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            });
        }else{
            res.json({
                status: true,
                message: "Thank you for participating in mCeas"
            })
        }
    })
        }
    })
})


apiRoutes.get('/',function(req,res){
    res.json({message : 'Welcome to the coolest API on earth'});
});

apiRoutes.get('/users',function(req,res){
    User.find({},function(err,users){
        res.json(users);
    });
});





app.use('/mcity/api',apiRoutes);


};