let express = require('express');
let app = express();
let mongoose = require('mongoose');
let jwt = require('jsonwebtoken');
let nodemailer = require('nodemailer');
let multer = require('multer');
let mime = require('mime');



//Sparkpost Configuration

//api = 'ab2b492340d9bcc52cb0cc1e01e7ed71cc595407'

let sparkpostapi = 'ab2b492340d9bcc52cb0cc1e01e7ed71cc595407';

let SparkPost = require('sparkpost');
let sparky = new SparkPost(sparkpostapi);


//Models

let User = require('../models/user');
let Shop = require('../models/shop');



let pass = "Noble_1234"











// var smtpTransport = nodemailer.createTransport('smtps://movehaul.developer%40gmail.com:Noble_1234@smtp.gmail.com');



let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "movehaul.developer@gmail.com",
        pass: pass
    }
})






//Logo

let logoStorage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"./public/logo")
    },
    filename: function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
})

let logoupload = multer({
    storage: logoStorage
}).array('logo',1);


module.exports = function(app){

//Own

app.post('/verify',function(req,res){

    var name = req.body.name;
    var password = req.body.password;

    function check(a,b){
        
        var name1 = "username";
        var password1 = "password";
    

        this.name = name;
        this.password = password;

        if((this.name !== name1) || (this.password !== password1)){
            return "Authentication failed";
        }else if((this.name == name1) || (this.password == password1)){
            return "Verified successfully";
        }
        
       

    }


      var a = check(name,password);
      res.json({
        status: a
      })

});

//Own

app.get('/verify',function(req,res){
    console.log(template)
    res.json({
        status: true
    })
})



//

// mailtest stored template












app.post('/mailtest',function(req,res){

    let email = req.body.email;

   

    let options = {
        sandbox: true
    }

    let content = {
        from: 'testing@sparkpostbox.com',
        subject: 'Hi',
        html: source
    }

   

    let recipients = [
        {address: email}
    ]

    

    sparky.transmissions.send({
        options: options,
        content: content,
        recipients: recipients
    })
    .then(data => {
        res.json({
            status: true,
            message: "success"
        })
    })
    .catch(err => {
        res.json({
            status: false,
            message: "Error Occured " + err
        })
    })


})







//

let opiniion = express.Router();




//sparkpost test -- inline

// opiniion.post('/mailtest',function(req,res){

//     let email = req.body.email;

//     let options = {
//         sandbox: true
//     }

//     let content = {
//         from: 'testing@sparkpostbox.com',
//         subject: 'Hi',
//         html: template
//     }

//     let recipients = [
//         {address: email}
//     ]

//     sparky.transmissions.send({
//         options: options,
//         content: content,
//         recipients: recipients
//     })
//     .then(data => {
//         res.json({
//             status: true,
//             message: "success"
//         })
//     })
//     .catch(err => {
//         res.json({
//             status: false,
//             message: "Error Occured " + err
//         })
//     })


// })











//Own


opiniion.post('/verify',function(req,res){

    var name = req.body.username;
    var password = req.body.password;

    function check(a,b){
        
        var name1 = "username@gmail.com";
        var password1 = "password";
    

        this.name = name;
        this.password = password;

        if((this.name !== name1) || (this.password !== password1)){
            return "Authentication failed";
        }else if((this.name == name1) || (this.password == password1)){
            return "Verified successfully";
        }
        
       

    }



      var a = check(name,password);
      res.json({
        status: a
      })

});


//dec

    // let token = req.headers['token'] || req.body.token;
    // let decode = jwt.decode(token);
    // let id = decode._doc._id;

//Own

opiniion.post('/admin',function(req,res){

    var newUser = new User(req.body);

    newUser.save((err,admin) => {
        if(err){
            res.send(err);
        }else{
            res.json({status: true,message: "Admin successfully added",admin});
        }
    })
    
});

//forget

opiniion.post('/forgetpassword',function(req,res){

    let email = req.body.email;

    User.findOne({"email":email},(err,user) => {
        if(err){
            res.json({
                status: "error",
                message: "Error Occured " + err
            })
        }else{
            if(!user){
                res.json({
                    status: false,
                    message: "No User exists"
                })
            }else if(user){

                let username = user.firstname + user.lastname ;

                let password = Math.floor(Math.random()*9000)+1000;

                let mailOptions = {
                    from: "movehaul.developer@gmail.com",
                    to: email,
                    subject: "Test",
                    html: "<b>Hello</b> " + username + " <b>your new password for opiniion is</b> " + password 
                }

                transporter.sendMail(mailOptions,function(err,done){
                    if(err){
                        res.json({
                            status: "error",
                            message: "Error Occured " + err
                        })
                    }else{

                        User.findOneAndUpdate({email: email},{$set:{"password":password}},{safe:true,upsert:true,new:true},(err,save) => {
                            if(err){
                                res.json({
                                    status: "error",
                                    message: "Error Occured " + err
                                })
                            }else{
                                res.json({
                                    status: true,
                                    message: "A New password has been sent to your email"
                                })
                            }
                        })
 
                    }
                })

                

            }
        }
    })

});
























app.use('/opiniion',opiniion);


//


let admin = express.Router();


admin.post('/login',function(req,res){

    User.findOne({
        email: req.body.email
    },function(err,user){
        if(err) throw err;

        if(!user){
            res.json({
                status: false,
                message: "Authentication failed.User not found"
            });
        }else if(user){
            if(user.password != req.body.password){
                res.json({
                    status: false,
                   message: "Authentication failed.Wrong password"
                });
            }else{
                let token = jwt.sign(user,app.get('superSecret'),{
                    expiresIn: "365 days"
                });

                let id = user._id;
                let category = user.category;
                let firstname = user.firstname;
                let lastname = user.lastname;
                let email = user.email;
                let phone = user.phone;
                let userid = user.userid;


                res.json({
                    status: true,
                    id: id,
                    token: token,
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    phone: phone,
                    category: category,
                    userid: userid
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
                return res.json({status: false, message: "Failed to authenticate token"});
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

admin.use(function(req,res,next){
    let id = req.headers['id'] || req.body.id ;
    
    if(id){
        next();
    }else{
        return res.status(403).send({
            status: false,
            message: "No Id provided"
        })
    }
})

// Adding clients


admin.post('/createclient',function(req,res){

    var newUser = new User();

    newUser.firstname = req.body.ctFirstname ;
    newUser.lastname = req.body.ctLastname ;
    newUser.email = req.body.ctEmail ;
    newUser.phone = req.body.ctMobile ;
    newUser.password = req.body.password ;
    newUser.category = req.body.userAuthLevel ;


    newUser.save((err,user) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                //dummy: user
            })
        }
    })

});


// Adding Business


admin.post('/createbusiness',function(req,res){

    
        let id = req.headers['id'];

        let id2 = req.body.clientId;

        User.find({_id:id2},{userid:1},(err,userid) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            var newShop = new Shop();

            newShop.userid = userid[0].userid ;

            newShop.companyname = req.body.companyName;
            newShop.address = req.body.companyAddress;
            newShop.city = req.body.city;
            newShop.state = req.body.state;
            newShop.zipcode = req.body.zipCode;
            newShop.phone = req.body.phone;
            newShop.buttoncolor = req.body.btnTxtColor; 
            newShop.footercolor = req.body.footerBgColor; 
            newShop.landingpage = req.body.landingPage;
            
           
            
            newShop.save((err,shop) => {
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                    res.json({
                        status:true,
                        //dummy: shop
                    })
                }
            })

            

          

        }



        })

})


/*

//Adding Business

admin.post('/createbusiness',function(req,res){

    
    let token = req.headers['token'] || req.body.token;
    let decode = jwt.decode(token);
    let id = decode._doc._id


    logoupload(req,res,function(err){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{



        User.find({_id:id},{email:1},(err,email) => {
        if(err){
            res.json({
                status: false
            })
        }else{

            var newShop = new Shop();

            newShop.companyname = req.body.companyname;
            newShop.address = req.body.address;
            newShop.city = req.body.city;
            newShop.state = req.body.state;
            newShop.zipcode = req.body.zipcode;
            newShop.phone = req.body.phone;
            newShop.email = email[0].email ;
            newShop.logo = req.files;

            newShop.save((err,shop) => {
                if(err){
                    res.json({
                        status: false
                    })
                }else{
                    res.json({
                        status:true
                    })
                }
            })


        }
    })


        }
    })


})

*/


// Adding 

admin.post('/addcustomer',function(req,res){

    
    let id = req.headers['id'];

    let shopId = req.body.shop_id;

    let firstname = req.body.c_firstname;
    let lastname = req.body.c_lastname;
    let email = req.body.c_email;
    let phone = req.body.c_mobile;
    let notes = req.body.c_notes;

  

    let options = {
        sandbox: true
    }

    let content = {
        from: 'testing@sparkpostbox.com',
        subject: 'Opiniion Feedback',
        html: source
    }

   

    let recipients = [
        {address: email}
    ]





    Shop.findByIdAndUpdate(shopId,{$push:{"customers":{$each:[{firstname: firstname,lastname: lastname,email: email,phone: phone,notes: notes}],$position: 0}}},{safe:true,upsert:true,new:true},(err,customer) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{


            
                sparky.transmissions.send({
                    options: options,
                    content: content,
                    recipients: recipients
                },(err,data) => {
                    if(err){
                        res.json({
                            status: false,
                            message: err
                        })
                    }else{
                        res.json({
                            status: true
                        })

                    }
                })
            



            // res.json({
            //     status: true,
            //   //dummy: customer
            // })
        }
    })

})


//Viewing

admin.get('/viewcustomer',function(req,res){

    let id = req.headers['id'];

    let shopId = req.headers['shop_id'];

    Shop.findById(shopId,{customers:1},(err,shop) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err 
            })
        }else{
            res.json({
                status: true,
                customers: shop,
                //dummy: shop
            })
        }
    })
})


// View Clients

admin.get('/viewclients',function(req,res){

    let id = req.headers['id'];

    User.find({"category":"clientadmin"},{firstname:1,lastname:1,email:1,phone:1,userid:1},(err,clients) => {
        if(err){
            res.json({
                status: false
            })
        }else{
            res.json({
                status: true,
                clients: clients
            })
        }
    })

})



// GET Business by client ID


admin.get('/getbusinessbyclientid',function(req,res){

    let id = req.headers['id'];

    let userid = req.headers['userid'];

    User.aggregate([
        {$match: {"userid":userid}},
        {$lookup:
        {
            from: "shops",
            localField: "userid",
            foreignField: "userid",
            as: "business"
        }}
    ]).exec((err,data) => {
        if(err){
            res.json({
                status: false
            })
        }else{
            res.json({
                status: true,
                business: data[0].business
            })
        }
    })
    
})

















app.use('/opiniion/api',admin);












}


