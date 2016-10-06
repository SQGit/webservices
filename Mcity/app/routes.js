var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var multer = require('multer');
var mime = require('mime');
var moment = require('moment');

var Time = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm');

var User = require('./models/user');
var Train = require('./models/train');

var storage = multer.diskStorage({
    destination : function (req,file,cb){
        cb(null,'./public/uploads');
    },
    filename: function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});


var upload = multer({
    storage : storage
}).array('file',6);



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

//Retrieving the uploaded documents    

app.get('/uploads/:name',function(req,res,next){
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

app.get('/',function(req,res){
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

app.post('/signup',function(req,res){
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
                userModel.password = req.body.password;
                userModel.save(function(err,user){
                    var token = jwt.sign(user,app.get('superSecret'),{
                    expiresIn: "24h"
                    });
                    user.save(function(err,user1){
                        res.json({
                            status: true,
                            message: 'You are successfully Registered',
                            token: user1.token
                        });
                    });
                })
            }
        }
    });
});


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

var apiRoutes = express.Router();

//Login

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
                    expiresIn: "24h"
                });

               var id = user._id;

                res.json({
                    status: true,
                    message: 'Logged in successfully!',
                    id : id,
                    token: token,
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
    upload(req,res,function(err){
        if(err){
            res.json({
                status : false,
                message : "Error Occured" + err
            });
        }else{
            User.findByIdAndUpdate(query,{$push:{"postforrent":{location : location,landmark : landmark,address: address,city : city,furnishedtype : furnishedtype,residential : residential, bedroom : bedroom,renttype : renttype,monthlyrent : monthlyrent,deposit : deposit,description : description,imageurl:req.files}}},
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

/*
//Search For Rent

apiRoutes.post('/searchforrent',function(req,res){
     var minvalue = req.body.minvalue;
     var maxvalue = req.body.maxvalue;
     User.find({"postforrent": {$elemMatch:{"bedroom":req.body.bedroom,"location":req.body.location,"residential":req.body.residential,"monthlyrent":{$gt:minvalue,$lte:maxvalue}}}},{"username":1,"email":1,"mobileno":1,"postforrent.$":1},
     function(err,info){
         if(err){
             res.json({
                 status: false,
                 message: "Search not found"
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
     User.find({"postforrent":{$elemMatch:{$or:[{"bedroom":req.body.bedroom} || {"location":req.body.location} || {"residential":req.body.residential} || {"furnishedtype":req.body.furnishedtype} || {"monthlyrent":{$gt:minvalue,$lte:maxvalue}}]}}},{"username":1,"email":1,"mobileno":1,"postforrent.$":1},
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

//Post for Room

apiRoutes.post('/postforroom',function(req,res){
       var query = req.headers['id'];
       User.findByIdAndUpdate(query,{$push:{"postforroom":{location:req.body.location,landmark:req.body.landmark,address:req.body.address,roomtype:req.body.roomtype,monthlyrent:req.body.monthlyrent,gender:req.body.gender,description:req.body.description}}},
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

   //Search for room

   apiRoutes.post('/searchforroom',function(req,res){
       var minvalue = req.body.minvalue;
       var maxvalue = req.body.maxvalue;
       User.find({"postforroom":{$elemMatch:{$or:[{"roomtype":req.body.roomtype} || {"location":req.body.location} || {"gender":req.body.gender} || {"monthlyrent":{$gt:minvalue,$lte:maxvalue}}]}}},{"username":1,"email":1,"mobileno":1,"postforroom.$":1},
       function(err,info){
           if(err){
               res.json({
                   status : false,
                   message : "Search not found"
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

   
//Post for Ride

apiRoutes.post('/postforride',function(req,res){
    var query = req.headers['id'];
    User.findByIdAndUpdate(query,{$push:{"postforride":{from:req.body.from,to:req.body.to,date:req.body.date,godate:req.body.godate,returndate:req.body.returndate,extraluggage:req.body.extraluggage,price:req.body.price,midwaydrop:req.body.midwaydrop}}},
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
                message : "Your Post has been added successfully"
            });
        }
    }
    );
});   

//Search for Ride

apiRoutes.post('/searchforride',function(req,res){
    var currenttime = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm');
    User.find({"postforride":{$elemMatch : {"date":{$gte:currenttime}}}},{"username":1,"email":1,"mobileno":1,"postforride.$":1},
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




//Search for Ride from-to

apiRoutes.post('/searchforridefilter',function(req,res){
    var currenttime = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm');
    User.find({"postforride":{$elemMatch :{$or:[ {"from":req.body.from} || {"to":req.body.to} || {"date":{$gte:currenttime}}]}}},{"username":1,"email":1,"mobileno":1,"postforride.$":1},
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

apiRoutes.post('/advancedsearch',function(req,res){
    User.find({"postforride":{$elemMatch:{$or:[{"from":req.body.from} || {"to":req.body.to} || {"time":req.body.time} || {"godate":req.body.godate} || {"returndate":req.body.returndate}  || {"extraluggage":req.body.extraluggage}]}}},{"username":1,"email":1,"mobileno":1,"postforride.$":1},
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

apiRoutes.post('/trainsearch',function(req,res){ 
    var time = req.body.departuretime;
    var a = Train.find({"mon":"y","departuretime":{$gte:time}},{"name":1,"departuretime":1,"arrivaltime":1,"_id":0}).limit(6);
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

apiRoutes.post('/trainsearchsun',function(req,res){
    var time = req.body.departuretime;
    var a = Train.find({"sun":"y","departuretime":{$gte:time}},{"name":1,"departuretime":1,"arrivaltime":1,"_id":0}).limit(6); 
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