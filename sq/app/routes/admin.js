let express = require('express');
let app = express();
let jwt = require('jsonwebtoken');
let mongoose = require('mongoose');
let moment = require('moment');

let path = require('path');


// remove later

let Api = require('../models/api');


let Admin = require('../models/admin');
let Shop = require('../models/shop');



var adminVersion = require('../models/adminversion');
var shopVersion = require('../models/shopversion');

let Service = require('../models/service');


module.exports = function(app){



let sq = express.Router();







// Get sold customers

sq.post('/getsoldcustomers',function(req,res){

    let id = req.headers['id'];

    Shop.find({},{"id":1,"shopname":1,"sold":1}).sort({_id:-1}).exec((err,info) => {
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























//=================================================================================//



// Demo register - NO RELATION

sq.post('/register',function(req,res){


    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email;
    let password = req.body.password;
   

            let newApi = new Api();

            newApi.firstname = req.body.firstname;
            newApi.lastname = req.body.lastname;
            newApi.email = req.body.email;
            newApi.password = req.body.password;

            newApi.save(function(err,info){
                if(err){
                    res.json({
                        code: 400,
                        failed: "error ocurred"
                    })
                }else{
                    res.json({
                        code: 200,
                        success: "user registered sucessfully"
                    })
                }
            })
            
   


})



// demo serve  NO RELATION

sq.get('/react', function (req, res) {


    // var options = {
    //     root: path.join(__dirname,'..','..','public','build')
    // };

    let file = path.join(__dirname,'..','..','public','build', 'index.html')

    let filename = 'index.html' ;

    res.sendFile(file);
     

    //   res.sendFile(filename,options,function(err){
    //     if(err){
    //         res.json({
    //             status : false,
    //             message : "Error Occured" + err
    //         });
    //     }else{
    //        console.log("file sent")
    //     }
    // });


});


//  NO RELATION

sq.get('/react/*/:content', function (req, res) {

    let dir = path.join(__dirname,'..','..','public','build')

    // let content = req.params.content

    let original = req.originalUrl;

    let filename = original.slice(9)

    let file = path.join(dir + filename);

    res.sendFile(file);
     

});



//=================================================================================//









// Create Super


sq.post('/createadmin',function(req,res){


    let username = req.body.username;
    let password = req.body.password;
   

            let newAdmin = new Admin();

            newAdmin.username = username;
            newAdmin.password = password;

            newAdmin.save(function(err,info){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                    res.json({
                        status: true,
                        message: "Admin created successfully"
                    })
                }
            })
            
   


})


// Create Admin


sq.post('/createshop',function(req,res){


    let shopname = req.body.shopname;
    let password = req.body.password;



            let newShop = new Shop();

            newShop.shopname = shopname;
            newShop.password = password;
            
            newShop.save(function(err,info){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                    res.json({
                        status: true,
                        message: "Shop created successfully"
                    })
                }
            })      

});





//Add Admin Version

sq.post('/addadminversion',function(req,res){
   

            var versionModel = new adminVersion();
            versionModel.version = req.body.version ;

            versionModel.save(function(err,save){
                res.json({
                   status : true,
                   message : "Version has been added successfully"
               }); 
           });
        

});


//Update Admin Version

sq.post('/updateadminversion',function(req,res){
    adminVersion.findOneAndUpdate({version : req.body.oldversion},{$set:{"version":req.body.newversion}},{safe:true,upsert:true,new:true},function(err,version){
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


//Check Admin Version

sq.post('/checkadminversion',function(req,res){
    adminVersion.findOne({version : req.body.version},function(err,version){
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





//Add Shop Version

sq.post('/addshopversion',function(req,res){
   

            var versionModel = new shopVersion();
            versionModel.version = req.body.version ;

            versionModel.save(function(err,save){
                res.json({
                   status : true,
                   message : "Version has been added successfully"
               }); 
           });
        

});


//Update Shop Version

sq.post('/updateshopversion',function(req,res){
    shopVersion.findOneAndUpdate({version : req.body.oldversion},{$set:{"version":req.body.newversion}},{safe:true,upsert:true,new:true},function(err,version){
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


//Check Admin Version

sq.post('/checkshopversion',function(req,res){
    shopVersion.findOne({version : req.body.version},function(err,version){
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








app.use('/sq',sq)



let admin = express.Router();


// Login 


admin.post('/login',function(req,res){

    let username = req.body.username;
    let password = req.body.password;


    Admin.findOne({"username":username},(err,user) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else if(!user){
            res.json({
                status: false,
                message: "Authentication failed. User not found"
            })
        }else if(user){
            if(user.password != password){
                res.json({
                    status: false,
                    message: "Authentication failed.Wrong password"
                })
            }else{
                let token = jwt.sign(user,app.get('superSecret'),{
                    expiresIn: "365 days"
                });

                let id = user._id;
                let username = user.username;
        

                res.json({
                    status:true,
                    id: id,
                    token: token,
                    username: username
                })


            }
        }
        

    })


})


admin.use(function(req,res,next){

    let token = req.body.token || req.query.token || req.headers['token'];

    if(token){
        jwt.verify(token,app.get('superSecret'),function(err,decoded){
            if(err){
                return res.json({status: false,message: "Failed to authenticate token"})
            }else{
                req.decoded = decoded;
                next();
            }
        });
    }else{
        return res.status(403).send({
            status: false,
            message: "No token provided"
        })
    }

})



// Get sold customers

admin.post('/getsoldcustomers',function(req,res){

    let id = req.headers['id'];

    Shop.find({},{"id":1,"shopname":1,"sold":1}).sort({_id:-1}).exec((err,info) => {
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


// Get Enquired Customers


admin.post('/getenquiredcustomers',function(req,res){

    Shop.find({},{"id":1,"shopname":1,"enquiry":1}).sort({_id:-1}).exec((err,info) => {
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









// Get Shop IDs

admin.post('/getshopids',function(req,res){

    let id = req.headers['id'];

    Shop.find({},{"id":1,"shopname":1},(err,info) => {
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


// Get sold customers By shop id

admin.post('/getsoldcustomersbyshopname',function(req,res){

    let id = req.headers['id'];
    
    let shopname = req.body.shopname

    Shop.findOne({"shopname":shopname},{"sold":1}).sort({_id:-1}).exec((err,info) => {
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


// Get Enquired Customers by shop id 


admin.post('/getenquiredcustomersbyshopname',function(req,res){

    let id = req.headers['id'];

    let shopname = req.body.shopname ;

    Shop.findOne({"shopname":shopname},{"enquiry":1}).sort({_id:-1}).exec((err,info) => {
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



// Get Sold Contacts by Shop name


admin.post('/getsoldcontactsbyshopname',function(req,res){

    let id = req.headers['id'];

    let shopname = req.body.shopname ;

    Shop.find({"shopname":shopname},{"sold.email":1,"sold.username":1,"sold.phone":1,"sold.dateofbirth":1}).sort({_id:-1}).exec((err,info) => {
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


// Get Enquired Contacts by shop name

admin.post('/getenquiredcontactsbyshopname',function(req,res){

    let id = req.headers['id'];

    let shopname = req.body.shopname ;

    Shop.find({"shopname":shopname},{"enquiry.email":1,"enquiry.username":1,"enquiry.phone":1,"enquiry.dateofbirth":1,"enquiry.comments":1}).sort({_id:-1}).exec((err,info) => {
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




// Get Sold customer count


admin.post('/getsoldcount',function(req,res){


    Shop.aggregate([
        {$unwind: {path:"$sold"}},
        {$project: {"sold":1,"_id":0}}
    ]).exec((err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                count: info.length
            })
        }
    })

})


// Get Enquired Customer Count

admin.post('/getenquiredcount',function(req,res){


    Shop.aggregate([
        {$unwind: {path:"$enquiry"}},
        {$project: {"enquiry":1,"_id":0}}
    ]).exec((err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                count: info.length
            })
        }
    })

})




// Get Sold contacts Rating from name


admin.post('/getsoldcontactsratingfromname',function(req,res){

    let id = req.headers['id'];

    let username = req.body.username;


    Shop.aggregate([
        {$match: {"sold.username": username}},
        {$unwind: "$sold"},
        {$match: {"sold.username": username}},
        {$project: {"sold.username":1,"sold.phone":1,"sold.rating":1}}
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











app.use('/sq/admin',admin)



















}
