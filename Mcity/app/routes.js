var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var multer = require('multer');
var mime = require('mime');
var User = require('./models/user');

var storage = multer.diskStorage({
    destination : function (req,file,cb){
        cb(null,'./public/uploads');
    },
    filename: function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});


module.exports = function(app){

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
            })
        }
    })
})

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

   apiRoutes.post('/searchforroom',function(req,res){
       var minvalue = req.body.minvalue;
       var maxvalue = req.body.maxvalue;
       User.find({"postforroom":{$elemMatch:{"roomtype":req.body.roomtype,"location":req.body.location,"gender":req.body.gender,"monthlyrent":{$gt:minvalue,$lte:maxvalue}}}},{"username":1,"email":1,"mobileno":1,"postforroom.$":1},
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