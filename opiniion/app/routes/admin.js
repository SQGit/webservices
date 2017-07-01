let express = require('express');
let app = express();
let mongoose = require('mongoose');
let jwt = require('jsonwebtoken');
let nodemailer = require('nodemailer');
let multer = require('multer');
let mime = require('mime');
let moment = require('moment');
let arrayUnion = require('array-union');
let shortid = require('shortid');

let request = require('request');
let axios = require('axios');


let bcrypt = require('bcryptjs');

let unique = require('uniqid');

let url = require('url');


let path = require('path');
let fs = require('fs');


let hbs = require('handlebars');


// Mysql connection

var pool = require('../connection');


//==============================

//Sparkpost Configuration

//api = 'ab2b492340d9bcc52cb0cc1e01e7ed71cc595407'

let sparkpostapi = 'ab2b492340d9bcc52cb0cc1e01e7ed71cc595407';

let SparkPost = require('sparkpost');
let sparky = new SparkPost(sparkpostapi);


//=============================

//Mandrill - Nodemailer

let mandrillTransport = require('nodemailer-mandrill-transport');

let mandrilkey = 'ryB4fivQNMoYMkosR9E0IA'

let transport = nodemailer.createTransport(mandrillTransport({
    auth:{
        apiKey: mandrilkey
    }
})) 

//===================

//Mandrill Api

let mandrill = require('mandrill-api/mandrill');

let mandrillClient = new mandrill.Mandrill(mandrilkey);






//Models

let User = require('../models/user');
let Shop = require('../models/shop');




// Email Templates

let EmailTemplate = require('email-templates').EmailTemplate;

//==============

// Nexmo

let Nexmo = require('nexmo');


let nexmo = new Nexmo({
    apiKey: '440a78e8',
    apiSecret: '7b938bee70608ef5'
})



//===================




let pass = 'Noble_1234';


var smtpTransport = nodemailer.createTransport('smtps://movehaul.developer%40gmail.com:Noble_1234@smtp.gmail.com');



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
        cb(null,"./public/shoplogo")
    },
    filename: function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
})

let logoupload = multer({
    storage: logoStorage
}).array('shoplogo',1);


//User Image

let userStorage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"./public/user")
    },
    filename: function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
})

let userUpload = multer({
    storage: userStorage
}).array('userimage',1)

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
    res.json({
        status: true
    })
})


app.get('/testtemp',function(req,res){

    res.render('index')

})



// registration

app.get('/reg',function(req,res){

    let registrationDir = path.join(__dirname,'..','..','templates','registration')

    let registration = new EmailTemplate(registrationDir);

    let email = "Hi@gmail.com";
    let phone = "+9112123244"

    let values = {email1:email,phone1:phone};

    registration.render(values,(err,regresult) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            let reghtml = regresult.html;

            let opiniionpath = path.join(__dirname,'..','..','public','opiniion/opiniionlogo.png');

            let opiniionBuf = fs.readFileSync(opiniionpath);    

            let opiniionContent = opiniionBuf.toString('base64');


            let message = {
                "html": reghtml,
                "subject": "Opiniion Registration",
                "from_email": "support@opiniionmail.com",
                "to": [{
                    "email": "hari@sqindia.net"
                }],
                "images": [{
                    'type': 'image/png',
                    'name': 'opiniionlogo.png',
                    'content': opiniionContent
                }]
            }

    
            
            mandrillClient.messages.send({"message": message},(result,err) => {
                if(result){
                    res.json({
                        status: true,
                        message: result
                    })
                }else{
                    res.json({
                        status: false,
                        message: err
                    })
                }
            })


            // let opiniionBuf = new Buffer(opiniionpath).toString('base64');

         //  let opiniionContent = new Buffer(opiniionBuf.split("base64,")[1],"base64");
            
            // transporter.sendMail({
            //         from: 'movehaul.developer@gmail.com',
            //         to: 'hari@sqindia.net',
            //         subject: 'Opiniion Feedback',
            //         html: reghtml,
            //         attachments: [{
            //             filename: 'opiniionlogo.png',
            //             path: opiniionpath,
            //             cid: 'opiniionlogo'
            //         }]
            //     },(err,info) => {
            //         if(err){
            //             res.json({
            //                 status: false,
            //                 message: "Error Occured " + err
            //             })
            //         }else{
            //             res.json({
            //                 status: true
            //             })      
            //         }
            //     })




                // transport.sendMail({
                //     from: 'support@opiniionmail.com',
                //     to: 'hari@sqindia.net',
                //     subject: 'Opiniion Feedback',
                //     html: reghtml,
                //     mandrillOptions: {
                //         images: [{
                //             'type': 'image/png',
                //             'name': 'opiniionlogo.png',
                //             'content': opiniionContent
                //         }]
                //     }
                // },(err,info) => {
                //     if(err){
                //         res.json({
                //             status: false,
                //             message: "Error Occured " + err
                //         })
                //     }else{
                //         res.json({
                //             status: true
                //         })      
                //     }
                // })

               

                // res.json({
                //     status: true
                // })


            
        }
    })

})












//



// Nexmo Test 



app.post('/nexmo',function(req,res){

    let from = '17252000019';
    let to = req.body.mobile;
    
    let message = "Hi there"

    nexmo.message.sendSms(from,to,message,(err,response) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: response
            })
        }
    })

})


// Encrypt  ================================================================================//



app.post('/encrypt',function(req,res){

    let name = req.body.name;

    let salt = bcrypt.genSaltSync(10);

    let hash = bcrypt.hashSync("B4c0/\/",salt);

    res.json({
        status: true,
        message: hash
    })

})


app.post('/decrypt',function(req,res){

    let code = req.body.code;

    let compare = bcrypt.compareSync("B4c0/\/",code);

    res.json({
        status: true,
        message: compare
    })

})


app.post('/uid',function(req,res){

    let name = req.body.name;

    let uid;

    if(name){
        uid = unique(String(name));
    }else{
        uid = unique();
    }


    res.json({
        status: true,
        message: uid
    })

})



app.post('/md5',function(req,res){

    let one = req.body.TERMINALID;
    let two = req.body.ORDERID;
    let three = req.body.AMOUNT;
    let four = req.body.DATETIME;
    let five = req.body.secret;

    let hash = md5(one+two+three+four+five);

    res.json({
        message: hash
    })

})



//============



//Get Test======================================================================//




app.get('/url',function(req,res){


    let username = req.query.username;

    let api;

    let uid,email,phone,firstname,lastname,notes;
    
    let email1 = req.query.email;

    res.json({
        status: true,
        username: username,
        email: email
    })


});

















//=================//






// mailtest stored template




app.post('/mandrilltest',function(req,res){

    let email = req.body.email;

    transport.sendMail({
        from: 'support@opiniionmail.com',
        to: email,
        subject: 'Hello',
        html: '<b>Hello Hi</b>'
    },function(err,info){
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







app.post('/mailtest',function(req,res){

    let email = req.body.email;

    let file = path.join(__dirname+'/a.js') 
    let source = fs.readFileSync(file,'utf-8')

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











// Opiniion



let opiniion = express.Router();








// opiniion test


opiniion.post('/url',function(req,res){

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }



    connection.query('SELECT * FROM link',(err,info) => {
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



        connection.release();
    })

})



// id 

opiniion.post('/id',function(req,res){

    let id = shortid.generate()

    console.log(id)

    res.json({
        status: true
    })

})



















opiniion.post('/uni',function(req,res){


    function equal(query){
        return reviews.data.reviews.filter(function(data){
            return data = 1496880715
        })
    }

    let t = moment.unix(1493618915).format('YYYY/MM/DD')
    
    res.json({
        status: true,
        t: t
    })

})






opiniion.get('/positivereviews',function(req,res){

    // let url = req.body.url;

    let url = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4&key=AIzaSyDkkoN28SzEXK_kgbskL5dtjr2Sw2KoSWE'


     

    function equal(query){
        return reviews.filter(function(data){
            let date =  + new Date()
            return data.time <= date
        })
    }

       

        
        
            axios.get(url)
                .then(function (response) {
                    return reviews = response.data.result.reviews
                    // return reviews = response.data
                })
                .then(function (reviews){
                   return final = equal(reviews)
                })
                .then(function(final){
                    res.json({
                        reviews: final
                    })
                })
                .catch(function (error) {
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                });

   

})









// 

opiniion.post('/test',function(req,res){

    let shopid = req.body.shopid;
    let customerid = req.body.customerid;


    Shop.findOne({"customers._id":customerid},{"customers.$":1,"rotators":1,"rotatorindex":1},(err,search) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            
              let index = search.rotatorindex - 1;

              let rotator = search.rotators[index].url

            //   console.log(index)

            //   let rotatorindex = search.rotatorindex + 1;


            let rotatorindex = search.rotatorindex ;
            let rotatorlength = search.rotators.length;

            

            function rotate(){

                let rotatorindexnew = rotatorindex ;

                if(rotatorindex == rotatorlength){
                    rotatorindexnew = 1
                }else{
                    rotatorindexnew = rotatorindex + 1
                }

                return rotatorindexnew;

            }

            let rotatorindexnew = rotate();

            // console.log(rotatorindexnew)

            Shop.findOneAndUpdate({"customers._id":customerid},{$set: {"rotatorindex":rotatorindexnew}},(err,info) => {
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                    
                    
                    res.json({
                        status: true,
                        message: search,
                        rotator: rotator
                    })

                }
            })



        }
    })

})



















// hbs


opiniion.post('/hbs',function(req,res){

    let source = "Hi {{user}}";
    let template = hbs.compile(source);

    let context = {user:"hari"}

    let html = template(context);

    res.json({
        status: true,
        message: html
    })

})







// add template



opiniion.post('/addtemplate',function(req,res){

    let shop_id = req.body.shop_id;

    let template = req.body.template;

    Shop.findByIdAndUpdate(shop_id,{$set:{"mailtemplate1":template}},(err,done) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true
            })
        }
    })

})








// send template

opiniion.post('/sendtemplate',function(req,res){

    let shop_id = req.body.shop_id;

    let email =  req.body.email;

    Shop.findById(shop_id,{"mailtemplate1":1},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{



            let source = info.mailtemplate1 ;


            let message = {
                    "html": html,
                    "subject": "Opiniion Template",
                    "from_email": "support@opiniionmail.com",
                    "to": [{
                        "email": email
                    }]

                }


                // mandrillClient.messages.send({"message": message},(result,err) => {
                //     if(result){
                //         let mandrillId = result[0]._id ;
                //         res.json({
                //             status: true
                //         })
                //     }else{
                //         res.json({
                //             status: false,
                //             message: "Error Occured " + err
                //         })
                //     }
                // })

                res.json({
                    status: true,
                    message: html
                })

        }
    })

})












// JWT


opiniion.post('/jwt',function(req,res){

    let shop_id = req.body.shop_id;

    let api = unique();

    Shop.findByIdAndUpdate(shop_id,{$set:{"api":api}},(err,done) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true
            })
        }
    })

})







// Pull


opiniion.post('/pull',function(req,res){

    let shop_id = req.body.shop_id;

    Shop.findByIdAndUpdate(shop_id,{$set:{"rotators":[]}},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err 
            })
        }else{
            res.json({
                status: true
            })
        }
    })

})





// Get users by shop


opiniion.post('/getusers',function(req,res){

    let shopid = req.body.businessId ;


    User.find({"shoprefid":shopid},{"email":1,"_id":0},function(err,client){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            let clientusers = client
        

    Shop.aggregate([
        {$match: {"shopid":shopid}},
        {$lookup: 
        {
         from: "users",
         localField: "userid",
         foreignField: "userid",
         as: "users"   
        }},
        {$project: {"users.email":1}}
    ]).exec(function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            let final = [];

            let users = info[0].users

        function all() {
            function con(){
                for(i=0;i<clientusers.length;i++){
                    final.push(clientusers[i].email)
                }
            }

            function cat(){
                for(i=0;i<users.length;i++){
                    final.push(users[i].email)
                }
            }

            con()
            cat()
        }

        all();


        let emails = arrayUnion(final);


            
        let message = {
                "html": "",
                "subject": "Opiniion Test",
                "from_email": "support@opiniionmail.com",
                "to": [{
                    "email": "hari@sqindia.net"
                },{
                    "email": "hari@sqindia.net"
                }],
                "track_opens": true,
                "track_clicks": true,

            }


                mandrillClient.messages.send({"message": message},(result,err) => {
                    if(result){

                         res.json({
                            status: true,
                            // emails: emails
                        })

                    }else{
                        res.json({
                            status: "false",
                            message: "Error Occured " + err
                        })

                    }
                })

 

          
        }
    })
            

        }

    })

    

})














// Add Rotator

opiniion.post('/addrotator',function(req,res){

    let shop_id = req.body.shop_id;
    let name = req.body.name;
    let url = req.body.url;

    Shop.findById(shop_id,{"rotatorindex":1},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            let value = info.rotatorindex + 1


    Shop.findByIdAndUpdate(shop_id,{$set:{"rotatorindex":value},$push:{"rotators":{$each:[{name:name,url:url}],$position:0}}},{safe:true,upsert:true,new:true},(err,rotator) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true
            })
        }
    })
           

        }
    })
   


})




// Use Rotator


opiniion.post('/userotator',function(req,res){

    let shop_id = req.body.shop_id;

    Shop.findById(shop_id,{"rotatorindex":1,"rotators":1},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            let rotatorindex = info.rotatorindex;
            let rotatorlength = info.rotators.length;

            if(rotatorindex == rotatorlength){

                Shop.findByIdAndUpdate(shop_id,{$set:{"rotatorindex":0}},{safe:true,upsert:true,new:true},(err,save) => {
                    if(err){
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        })
                    }else{
                        res.json({
                            status: true
                        })
                    }
                })

            }else{

                    rotatorindex += 1;

                 Shop.findByIdAndUpdate(shop_id,{$set:{"rotatorindex":rotatorindex}},{safe:true,upsert:true,new:true},(err,save) => {
                    if(err){
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        })
                    }else{
                        res.json({
                            status: true
                        })
                    }
                })


            }

        
        }
    })

})



// Test Rotator


opiniion.post('/testrotator',function(req,res){

    let shop_id = req.body.shop_id;

    let obj = req.body.rotator
    let key = Object.keys(obj);



            // function name1(){
            //     for(var i=0;i<obj.length;i++){
            //         name = obj[key[i]].name

            //         Name.push(obj[key[i]].name)
            //     }
            // }

            // function url1(){
            //     for(var i=0;i<obj.length;i++){
            //         Url.push(obj[key[i]].url)
            //     }
            // }


    //         name1()
    //         url1()
 


    // function lel(){

    //     for(var i=0;i<obj.length;i++){
    //         Tot.push(obj[key[i]])
    //     }

    // }

    // lel();


    // res.json({
    //     status: true,
    //     obj: obj,
    //     name: Name,
    //     url: Url,
    //     tot: Tot
    // })


   Shop.findById(shop_id,{"rotatorindex":1},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            let value = info.rotatorindex + 1

            let name;
            let url;

    for(var i=0;i<obj.length;i++){  // start of for

            name = obj[key[i]].name
            url = obj[key[i]].url

    
    
    
    Shop.findByIdAndUpdate(shop_id,{$set:{"rotatorindex":value},$push:{"rotators":{$each:[{name:name,url:url}],$position:0}}},{safe:true,upsert:true,new:true},function(err,rotator){
    
    
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            console.log("rotator added")
        }
    })

        }   // end of for 

        }
    })

    //

    res.json({
        status: true
    })


   

})








// Add customer - Webhook

opiniion.get('/customer',function(req,res){


    let shopId = req.query.uid;

    let api = req.query.api;

    let firstname = req.query.firstname;
    let lastname = req.query.lastname;
    let email = req.query.email;
    let countrycode = req.query.countrycode;
    let phone= req.query.phone;
    let notes = req.query.notes;

    let frommobile = '17252000019';
    let tomobile = countrycode + phone;


    let feedbackDir = path.join(__dirname,'..','..','templates','feedback3')
    let feedback3 = new EmailTemplate(feedbackDir);

    
     Shop.findOne({"shopid":shopId},{companyname:1,api:1,mailtemplate1:1,msgtemplate1:1,logo:1,fromname:1,buttoncolor:1,footercolor:1,mailtemplate1subject:1,mailactive:1,messageactive:1,email:1,shopid:1},(err,company) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{


            let logoimage = company.logo[0].filename;

            let opiniionpath = path.join(__dirname,'..','..','public','shoplogo',logoimage);

            let opiniionBuf = fs.readFileSync(opiniionpath);    

            let opiniionContent = opiniionBuf.toString('base64');

            let fromname = company.fromname ;

           
            let companyname = company.companyname;
            let shoprefid = company.shopid;

            let source = company.mailtemplate1 ;
            let subject = company.mailtemplate1subject ;

            let textsource = company.msgtemplate1 ;
            let buttoncolor = company.buttoncolor ;
            let footercolor = company.footercolor ;
            
            let mailactive = company.mailactive;
            let messageactive = company.messageactive;

            let replyemail = company.email;

          
            let createdAt = moment().add(5.5,'hours').format('YYYY/MM/DD T H:mm:ss');


            let verifyapi = company.api;

    if(api == verifyapi){

                
    Shop.findOneAndUpdate({"shopid":shopId},{$push:{"customers":{$each:[{firstname: firstname,lastname: lastname,email: email,countrycode: countrycode,phone: phone,notes: notes,createdAt: createdAt}],$position: 0}}},{safe:true,upsert:true,new:true},(err,customer) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{


            // else 1


            

        function Mail(){



            feedback3.render(values,(err,feedresult) => {
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{

                    let feedhtml = feedresult.html;



                let message = {
                    "html": feedhtml,
                    "subject": subject,
                    "from_email": "no-reply@opiniionmail.com",                   //support@opiniionmail.com
                    "from_name": fromname,
                    "to": [{
                        "email": email
                    }],
                    "images": [{
                    'type': 'image/png',
                    'name': logoimage,
                    'content': opiniionContent
                    }],
                    "track_opens": true,
                    "track_clicks": true,
                }


                mandrillClient.messages.send({"message": message},(result,err) => {
                    if(result){
                        let mandrillId = result[0]._id ;
                        
                        Shop.findOneAndUpdate({"customers._id": customerid},{$set: {"customers.$.mandrillId": mandrillId}},{safe: true,upsert: true,new: true},(err,info) => {
                            if(err){
                                res.json({
                                    status: false,
                                    message: "Error Occured " + err
                                })
                            }else{

                        res.json({
                            status: true
                        })
                                        
                  // final              
                            }
                        })


                    }else{
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        })
                    }
                })


                }
            })

            ///Mail

        }



// Message

        function Message(){


            nexmo.message.sendSms(frommobile,tomobile,text,(err,response) => {
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
                    

                        connection.query('INSERT INTO link SET url = ?,shortened = ?,shorturl = ?',[url,shortened,shorturl],(err,info) => {
                            if(err){
                                res.json({
                                    status: false,
                                    message: "Error in connecting Database"
                                })
                            }else{
                                res.json({
                                    status: true
                                })
                            }
                        })

                            connection.release()
                        })





                        // res.json({
                        //     status: true
                        // })
                    }
                })


            /// Message

        }


        function mailMessage(){

    

            feedback3.render(values,(err,feedresult) => {
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{

                    let feedhtml = feedresult.html;



                let message = {
                    "html": feedhtml,
                    "subject": subject,
                    "from_email": "no-reply@opiniionmail.com",                   //support@opiniionmail.com
                    "from_name": fromname,
                    "to": [{
                        "email": email
                    }],
                    "headers": {
                    "Reply-To": replyemail
                    },
                    "images": [{
                    'type': 'image/png',
                    'name': logoimage,
                    'content': opiniionContent
                    }],
                    "track_opens": true,
                    "track_clicks": true,
                }


                mandrillClient.messages.send({"message": message},(result,err) => {
                    if(result){
                        let mandrillId = result[0]._id ;
                        
                        Shop.findOneAndUpdate({"customers._id": customerid},{$set: {"customers.$.mandrillId": mandrillId}},{safe: true,upsert: true,new: true},(err,info) => {
                            if(err){
                                res.json({
                                    status: false,
                                    message: "Error Occured " + err
                                })
                            }else{


            nexmo.message.sendSms(frommobile,tomobile,text,(err,response) => {
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

                           
    
                        connection.query('INSERT INTO link SET url = ?,shortened = ?,shorturl = ?',[url,shortened,shorturl],(err,info) => {
                            if(err){
                                res.json({
                                    status: false,
                                    message: "Error in connecting Database"
                                })
                            }else{
                                res.json({
                                    status: true
                                })
                            }
                        })

                            connection.release()
                        })


                        // res.json({
                        //     status: true
                        // })
                    }
                })

                                        
                  // final              
                            }
                        })


                    }else{
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        })
                    }
                })


                }
            })




        }
        





            let customerid = customer.customers[0]._id;

        let r1 = 'http://104.197.80.225:8080/opiniionnew/feedback/1/' + shoprefid + '/' + customerid ;

        let r2 = 'http://104.197.80.225:8080/opiniionnew/feedback/2/' + shoprefid + '/' + customerid ;

        let r3 = 'http://104.197.80.225:8080/opiniionnew/rd/3/' + shoprefid + '/' + customerid ;

        let r4 = 'http://104.197.80.225:8080/opiniionnew/rd/4/' + shoprefid + '/' + customerid ;

        let r5 = 'http://104.197.80.225:8080/opiniionnew/rd/5/' + shoprefid + '/' + customerid ;


        let url = 'http://104.197.80.225:8080/opiniionnew/review/' + shoprefid + '/' + customerid ;


        let shortened =  shortid.generate()

        let shorturl = "http://www.opni.in/" + shortened

             let values = {source1: source,url1: r1,url2: r2,url3: r3,url4: r4,url5: r5,logoimage1: logoimage,buttoncolor1: buttoncolor,companyname1: companyname,footercolor1: footercolor}
            
            let text = textsource + " " + shorturl ;

            
        
        
        if(mailactive == "true" && messageactive == "true"){
            mailMessage()
        }else if(mailactive == "true"){
            Mail()
        }else if(messageactive == "true"){
            Message()
        }else{    
            res.json({
                status: true
            })
        } 








            // End of else 1

        }
    })




    


    }else{

        res.json({
            status: false,
            message: "Wrong api"
        })

    }
    



        }
    })


    
})






















// // Add customer

// opiniion.get('/customerold2',function(req,res){


//     let shopId = req.query.uid;

//     let api = req.query.api;

//     let firstname = req.query.firstname;
//     let lastname = req.query.lastname;
//     let email = req.query.email;
//     let countrycode = req.query.countrycode;
//     let phone= req.query.phone;
//     let notes = req.query.notes;

//     let frommobile = '17252000019';
//     let tomobile = countrycode + phone;


//     let feedbackDir = path.join(__dirname,'..','..','templates','feedback3')
//     let feedback3 = new EmailTemplate(feedbackDir);

    
//      Shop.findOne({"shopid":shopId},{companyname:1,api:1,mailtemplate1:1,msgtemplate1:1,logo:1,fromname:1,buttoncolor:1},(err,company) => {
//         if(err){
//             res.json({
//                 status: false,
//                 message: "Error Occured " + err
//             })
//         }else{

//             console.log(company)

//             let logoimage = company.logo[0].filename;

//             let opiniionpath = path.join(__dirname,'..','..','public','shoplogo',logoimage);

//             let opiniionBuf = fs.readFileSync(opiniionpath);    

//             let opiniionContent = opiniionBuf.toString('base64');

//             let fromname = company.fromname ;

           
//             let companyname = company.companyname;
//             let shoprefid = company.shopid;

//             let source = company.mailtemplate1;

//             let textsource = company.msgtemplate1 ;
//             let buttoncolor = company.buttoncolor ;
            

          

//             let createdAt = moment().add(5.5,'hours').format('YYYY/MM/DD T H:mm:ss');


//             let verifyapi = company.api;

//     if(api == verifyapi){

                
//     Shop.findOneAndUpdate({"shopid":shopId},{$push:{"customers":{$each:[{firstname: firstname,lastname: lastname,email: email,countrycode: countrycode,phone: phone,notes: notes,createdAt: createdAt}],$position: 0}}},{safe:true,upsert:true,new:true},(err,customer) => {
//         if(err){
//             res.json({
//                 status: false,
//                 message: "Error Occured " + err
//             })
//         }else{

//             let customerid = customer.customers[0]._id;

//         let r1 = 'http://104.197.80.225:8080/opiniion/feedback/1/' + shoprefid + '/' + customerid ;

//         let r2 = 'http://104.197.80.225:8080/opiniion/feedback/2/' + shoprefid + '/' + customerid ;

//         let r3 = 'http://104.197.80.225:8080/opiniion/rd/3/' + shoprefid + '/' + customerid ;

//         let r4 = 'http://104.197.80.225:8080/opiniion/rd/4/' + shoprefid + '/' + customerid ;

//         let r5 = 'http://104.197.80.225:8080/opiniion/rd/5/' + shoprefid + '/' + customerid ;


//         let url = 'http://104.197.80.225:8080/opiniion/review/' + shoprefid + '/' + customerid ;

//              let values = {source1: source,url1: r1,url2: r2,url3: r3,url4: r4,url5: r5,logoimage1: logoimage,buttoncolor1: buttoncolor,companyname1: companyname}
            
//             let text = textsource + " " + url ;

//             feedback3.render(values,(err,feedresult) => {
//                 if(err){
//                     res.json({
//                         status: false,
//                         message: "Error Occured " + err
//                     })
//                 }else{

//                     let feedhtml = feedresult.html;


//                 let message = {
//                     "html": feedhtml,
//                     "subject": "Opiniion Feedback",
//                     "from_email": "no-reply@opiniionmail.com",                   //support@opiniionmail.com
//                     "from_name": fromname,
//                     "to": [{
//                         "email": email
//                     }],
//                     "images": [{
//                     'type': 'image/png',
//                     'name': logoimage,
//                     'content': opiniionContent
//                     }],
//                     "track_opens": true,
//                     "track_clicks": true,
//                 }


//                 mandrillClient.messages.send({"message": message},(result,err) => {
//                     if(result){
//                         let mandrillId = result[0]._id ;
                        
//                         Shop.findOneAndUpdate({"customers._id": customerid},{$set: {"customers.$.mandrillId": mandrillId}},{safe: true,upsert: true,new: true},(err,info) => {
//                             if(err){
//                                 res.json({
//                                     status: false,
//                                     message: "Error Occured " + err
//                                 })
//                             }else{



//             nexmo.message.sendSms(frommobile,tomobile,text,(err,response) => {
//                     if(err){
//                         res.json({
//                             status: false,
//                             message: "Error Occured " + err
//                         })
//                     }else{
//                         res.json({
//                             status: true
//                         })
//                     }
//                 })
                    
                                                
//                             }
//                         })


//                     }else{
//                         res.json({
//                             status: false,
//                             message: "Error Occured " + err
//                         })
//                     }
//                 })


//                 }
//             })


//         }
//     })





//     }else{

//         res.json({
//             status: false,
//             message: "Wrong api"
//         })

//     }
    



//         }
//     })


    
// })










// // Add customer  --CHANGE THIS

// opiniion.get('/customerold',function(req,res){


//     let shopId = req.query.uid;

//     let api = req.query.api;

//     let firstname = req.query.firstname;
//     let lastname = req.query.lastname;
//     let email = req.query.email;
//     let countrycode = req.query.countrycode;
//     let phone= req.query.phone;
//     let notes = req.query.notes;

//     let frommobile = '17252000019';
//     let tomobile = countrycode + phone;


//     let feedbackDir = path.join(__dirname,'..','..','templates','feedback')
//     let feedback = new EmailTemplate(feedbackDir);


//      Shop.findOne({"shopid":shopId},{companyname:1,api:1},(err,company) => {
//         if(err){
//             res.json({
//                 status: false,
//                 message: "Error Occured " + err
//             })
//         }else{
           
//             let companyname = company.companyname;

//             let verifyapi = company.api;

//             console.log(verifyapi);
//             console.log(api)

//             let createdAt = moment().add(5.5,'hours').format('YYYY/MM/DD T H:mm:ss');


//     if(api == verifyapi){




                
//     Shop.findOneAndUpdate({"shopid":shopId},{$push:{"customers":{$each:[{firstname: firstname,lastname: lastname,email: email,countrycode: countrycode,phone: phone,notes: notes,createdAt: createdAt}],$position: 0}}},{safe:true,upsert:true,new:true},(err,customer) => {
//         if(err){
//             res.json({
//                 status: false,
//                 message: "Error Occured " + err
//             })
//         }else{

//             let customerid = customer.customers[0]._id;

//             let r1 = 'http://104.197.80.225:8080/opiniion/feedback/1/' + shopId + '/' + customerid ;
//             let r2 = 'http://104.197.80.225:8080/opiniion/feedback/2/' + shopId + '/' + customerid ;

//             let r3 = 'http://104.197.80.225:8080/opiniion/rd/3/' + shopId + '/' + customerid + '/' + 'ChIJ8yjigEuFTYcRde7tEbNvi7Y'

//             let feedurl = 'http://104.197.80.225:8080/opiniion/review/' + shopId + '/' + customerid ;

//             let values = {company1:companyname,username1:firstname,url1:r1,url2:r2,url3:r3,feedurl1:feedurl}
            
//             let text = "Hi " + firstname + " ,We would love to hear your feedback about your shopping experience with us. " + feedurl

//             feedback.render(values,(err,feedresult) => {
//                 if(err){
//                     res.json({
//                         status: false,
//                         message: "Error Occured " + err
//                     })
//                 }else{

//                     let feedhtml = feedresult.html;


//                 let message = {
//                     "html": feedhtml,
//                     "subject": "Opiniion Feedback",
//                     "from_email": "support@opiniionmail.com",
//                     "to": [{
//                         "email": email
//                     }],
//                     "track_opens": true,
//                     "track_clicks": true,

//                 }


//                 mandrillClient.messages.send({"message": message},(result,err) => {
//                     if(result){
//                         let mandrillId = result[0]._id ;
                        
//                         Shop.findOneAndUpdate({"customers._id": customerid},{$set: {"customers.$.mandrillId": mandrillId}},{safe: true,upsert: true,new: true},(err,info) => {
//                             if(err){
//                                 res.json({
//                                     status: false,
//                                     message: "Error Occured " + err
//                                 })
//                             }else{



//             nexmo.message.sendSms(frommobile,tomobile,text,(err,response) => {
//                     if(err){
//                         res.json({
//                             status: false,
//                             message: "Error Occured " + err
//                         })
//                     }else{
//                         res.json({
//                             status: true
//                         })
//                     }
//                 })
                    
                                                
//                             }
//                         })


//                     }else{
//                         res.json({
//                             status: false,
//                             message: err
//                         })
//                     }
//                 })


//                 }
//             })


//         }
//     })



//     }else{

//         res.json({
//             status: false,
//             message: "Wrong api"
//         })

//     }
    



//         }
//     })


    
// })














opiniion.post('/info',function(req,res){

    let now = moment().add(10,'days').format('YYYY/MM/DD T H:mm:ss');

    res.json({
        status: true,
        message: now
    })

})











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






//Get Total engaged users - all


opiniion.post('/gettotalsubmittedusersall',function(req,res){

  
    Shop.aggregate([
        {
            $project: {"_id":0 ,"customers": 
                {
                    $map: {
                        input: "$customers",
                        as: "customer",
                        in: {$size: "$$customer"}
                        }
            }
        }
        }
    ]).exec(function(err,customers){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: customers
            })
        }
    })


})










// Webhook URL

opiniion.post('/testmessage',function(req,res){

    console.log(res.body)

    res.json({
        status: true
    })

})


// Webhook Configuration

opiniion.post('/addwebhook',function(req,res){

    let url = "http://104.197.80.225:3010/opiniion/testmessage"
    let description = "Test Webhook";

    let events = [
        "send",
        "open",
        "click"
    ]

    mandrillClient.webhooks.add({"url": url,"description": description,"events":events},function(result,err){
        if(result){
            res.json({
                status: true,
                message: result
            })
        }else{
            res.json({
                status: false,
                message: err
            })
        }
    })


})



// Get Webhooks 

opiniion.post('/getwebhooks',function(req,res){

    mandrillClient.webhooks.list({},function(result,err){
        if(result){
            res.json({
                status: true,
                message: result
            })
        }else{
            res.json({
                status: false,
                message: err
            })
        }
       
    })


})


// Get Message Info

opiniion.post('/getmessageinfo',function(req,res){

    let id = req.body.id

    mandrillClient.messages.info({"id":id},function(result,err){

        if(result){
            res.json({
                status: result
            })
        }else{
            res.json({
                status: false,
                message: err
            })
        }

        
    })



})
















// Get User Image

opiniion.get('/user/:name',function(req,res,next){

    let options = {
        root: path.join(__dirname,'..','..','public','user')
    }

    let filename = req.params.name ;

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



// Get Logo Image


opiniion.get('/logo/:name',function(req,res,next){

    let options = {
        root: path.join(__dirname,'..','..','public','shoplogo')
    }

    let filename = req.params.name;

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



// Get customer and shop - No Token


opiniion.post('/getcustomershopnotoken',function(req,res){

    let customerid = req.body.customerid;
    let shopid = req.body.shopid;

    Shop.find({"customers":{$elemMatch:{"_id":customerid}}},{"companyname":1,"logo":1,"rotators":1,"landline1":1,"landline2":1,"landline3":1,"reviewline1":1,"reviewline2":1,"reviewline3":1,"buttoncolor":1},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                customer: info
            })
        }
    })


})






//Post rating - No Token

opiniion.post('/postratingnotoken',function(req,res){

    let shopid = req.body.businessId;
    let customerid = req.body.customerId;

    let rating = req.body.rating;
    let feedback = req.body.cfeedback;

    let engagedAt = moment().add(5.5,'hours').format('YYYY/MM/DD T H:mm:ss');

    let negativeDir = path.join(__dirname,'..','..','templates','negative')
    let negative = new EmailTemplate(negativeDir);

     let opiniionpath = path.join(__dirname,'..','..','public','opiniion','opiniionlogo.png');

    let opiniionBuf = fs.readFileSync(opiniionpath);    

    let opiniionContent = opiniionBuf.toString('base64');

    if(customerid){


    Shop.findOne({"customers._id":customerid},{"customers.$":1},(err,search) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

           
            
            let comments = feedback ;

            let firstname = search.customers[0].firstname ;
            let lastname = search.customers[0].lastname ;

            let name = firstname + " " + lastname ;

            let countrycode = search.customers[0].countrycode ;
            let phone = search.customers[0].phone ;

            let phone_number = countrycode + " " + phone ;

            let email_address = search.customers[0].email ;

           



            if(search.customers[0].rating == "null"){

                

    Shop.findOneAndUpdate({"customers._id":customerid},{$set:{"customers.$.rating":rating,"customers.$.feedback":feedback,"customers.$.engagedAt":engagedAt}},{safe:true,upsert:true,new:true},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{



    
    User.find({"shoprefid":shopid},{"email":1,"_id":0},function(err,client){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            let clientusers = client
        

    Shop.aggregate([
        {$match: {"shopid":shopid}},
        {$lookup: 
        {
         from: "users",
         localField: "userid",
         foreignField: "userid",
         as: "users"   
        }},
        {$project: {"users.email":1}}
    ]).exec(function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            let final = [];

            let users = info[0].users

        function all() {
            function con(){
                for(i=0;i<clientusers.length;i++){
                    final.push(clientusers[i].email)
                }
            }

            function cat(){
                for(i=0;i<users.length;i++){
                    final.push(users[i].email)
                }
            }

            con()
            cat()
        }

        all();


        let emails = arrayUnion(final);


        
        to = [];

        function mail(){

            for(var i=0;i<emails.length;i++){
                to.push({"email":emails[i]})
            }
        }

        mail();


        let subject = "You've Received Private Feedback From " + firstname + " " + lastname


        // let html1 = `<b>comments: ${comments}
        //             <b>name: ${name}
        //             <b>phone_number: ${phone_number}
        //             <b>email_address: ${email_address}`


        // let html = '<b>comments: </b>' + comments + '<br>' + '<b>name: </b>' + name + '<br>' + '<b>phone_number: </b>' + phone_number + '<br>' + '<b>email_address: </b>' + email_address 



        

        let values = {comments1: comments,name1: name,phone_number1: phone_number,email_address1: email_address};


        negative.render(values,(err,negresult) => {
            if(err){
                res.json({
                    status: false,
                    message: "Error Occured " + err
                })
            }else{

                let neghtml = negresult.html;

                    
        let message = {
                "html": neghtml,
                "subject": subject,
                "from_email": "notifications@opiniionmail.com",                 //support@opiniionmail.com
                "from_name": "Opiniion Feedback",
                "to": to,
                // "images": [{
                //     'type': 'image/png',
                //     'name': 'opiniionlogo.png',
                //     'content': opiniionContent
                // }],
                 "headers": {
                    "Reply-To": "message.reply@example.com"
                },
                "track_opens": true,
                "track_clicks": true,

        }


//
        
                mandrillClient.messages.send({"message": message},(result,err) => {
                    if(result){

                         res.json({
                               status: true,
                                 message: "Your Rating has been updated successfully"
                        })

                    }else{
                        res.json({
                            status: "false",
                            message: "Error Occured " + err
                        })

                    }
                })

//







            }

        })
            




 

 //

          }
    })



        }

    })




            // res.json({
            //     status: true,
            //     message: "Your Rating has been updated successfully"
            // })



        }
    })


            }else{
                res.json({
                    status: false,
                    message: "You have rated us already"
                })
            }
        }
    })


    }else{     // Mandrill Ignore

        res.json({
            status: false,
            message: "Please check input credentials"
        })

    }



})







//Post rating - No Token

opiniion.post('/postratingpositive',function(req,res){

    let shopid = req.body.businessId;
    let customerid = req.body.customerId;

    let rating = req.body.rating;
    let feedback = req.body.cfeedback;

    let engagedAt = moment().add(5.5,'hours').format('YYYY/MM/DD T H:mm:ss');

    if(customerid){


    Shop.findOne({"customers._id":customerid},{"customers.$":1,"rotators":1,"rotatorindex":1},(err,search) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            let index = search.rotatorindex - 1;

            let rotator = search.rotators[index].url

            let rotatorindex = search.rotatorindex;
            let rotatorlength = search.rotators.length;

            if(search.customers[0].rating == "null"){

// Loop starts


            

             // Assign rotator

            


        
        function rotate(){

                let rotatorindexnew = rotatorindex ;

                if(rotatorindex == rotatorlength){
                    rotatorindexnew = 1
                }else{
                    rotatorindexnew = rotatorindex + 1
                }

                return rotatorindexnew;

            }

        let rotatorindexnew = rotate();


        

    Shop.findOneAndUpdate({"customers._id":customerid},{$set:{"customers.$.rating":rating,"customers.$.engagedAt":engagedAt,"rotatorindex":rotatorindexnew}},{safe:true,upsert:true,new:true},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{



    
    User.find({"shoprefid":shopid},{"email":1,"_id":0},function(err,client){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            let clientusers = client
        

    Shop.aggregate([
        {$match: {"shopid":shopid}},
        {$lookup: 
        {
         from: "users",
         localField: "userid",
         foreignField: "userid",
         as: "users"   
        }},
        {$project: {"users.email":1}}
    ]).exec(function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            let final = [];

            let users = info[0].users

        function all() {
            function con(){
                for(i=0;i<clientusers.length;i++){
                    final.push(clientusers[i].email)
                }
            }

            function cat(){
                for(i=0;i<users.length;i++){
                    final.push(users[i].email)
                }
            }

            con()
            cat()
        }

        all();


        let emails = arrayUnion(final);


        
        to = [];

        function mail(){

            for(var i=0;i<emails.length;i++){
                to.push({"email":emails[i]})
            }
        }

        mail();



            
        let message = {
                "html": "<p>You have received a new feedback!!</p>",
                "subject": "Opiniion Feedback",
                "from_email": "no-reply@opiniionmail.com",                //support@opiniionmail.com
                "from_name": "Opiniion Feedback",
                "to": to,
                "track_opens": true,
                "track_clicks": true,

            }


                mandrillClient.messages.send({"message": message},(result,err) => {
                    if(result){

                         res.json({
                               status: true,
                                 message: "Your Rating has been updated successfully",
                                 rotator: rotator
                        })

                    }else{
                        res.json({
                            status: "false",
                            message: "Error Occured " + err
                        })

                    }
                })

 

          }
    })



        }

    })




            // res.json({
            //     status: true,
            //     message: "Your Rating has been updated successfully"
            // })



        }
    })


            }else{
                res.json({
                    status: false,
                    message: "You have rated us already",
                    rotator: rotator
                })
            }
        }
    })


    }else{     // Mandrill Ignore

        res.json({
            status: false,
            message: "Please check input credentials"
        })

    }



})

















app.use('/opiniion',opiniion);


//


let admin = express.Router();




// Login

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
            }else if(user.access == "denied"){
                    res.json({
                        status: false,
                        message: "Sorry.You dont have access to login"
                    })
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

                let userimage = "";
                let shopid = "";
                let shoprefid = "";
                let changepass= "";


                if(user.userimage.length == 0){
                    userimage += "null" 
                }else{
                     userimage += user.userimage[0].filename
                }

              

                if(!user.shopid){
                    shopid += "null" 
                }else{
                    shopid += user.shopid
                }

                if(!user.shoprefid){
                    shoprefid += "null"
                }else{
                    shoprefid += user.shoprefid
                }

                if(!user.changepass){
                    changepass += "null"
                }else{
                    changepass += user.changepass
                }



                res.json({
                    status: true,
                    id: id,
                    token: token,
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    phone: phone,
                    category: category,
                    userid: userid,
                    userimage: userimage,
                    shopid: shopid,
                    shoprefid: shoprefid,
                    changepass: changepass
                })
            }
        }
    })
})







// // Login

// admin.post('/login',function(req,res){

//     User.findOne({
//         email: req.body.email
//     },function(err,user){
//         if(err) throw err;

//         if(!user){
//             res.json({
//                 status: false,
//                 message: "Authentication failed.User not found"
//             });
//         }else if(user){
//             if(user.password != req.body.password){
//                 res.json({
//                     status: false,
//                    message: "Authentication failed.Wrong password"
//                 });
//             }else{
//                 let token = jwt.sign(user,app.get('superSecret'),{
//                     expiresIn: "365 days"
//                 });

//                 let id = user._id;
//                 let category = user.category;
//                 let firstname = user.firstname;
//                 let lastname = user.lastname;
//                 let email = user.email;
//                 let phone = user.phone;
//                 let userid = user.userid;

//                 let userimage = "";
//                 let shopid = "";
//                 let shoprefid = "";


//                 if(user.userimage.length == 0){
//                     userimage += "null" 
//                 }else{
//                      userimage += user.userimage[0].filename
//                 }

              

//                 if(!user.shopid){
//                     shopid += "null" 
//                 }else{
//                     shopid += user.shopid
//                 }

//                 if(!user.shoprefid){
//                     shoprefid += "null"
//                 }else{
//                     shoprefid += user.shoprefid
//                 }



//                 res.json({
//                     status: true,
//                     id: id,
//                     token: token,
//                     firstname: firstname,
//                     lastname: lastname,
//                     email: email,
//                     phone: phone,
//                     category: category,
//                     userid: userid,
//                     userimage: userimage,
//                     shopid: shopid,
//                     shoprefid: shoprefid
//                 })
//             }
//         }
//     })
// })


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










//Create Admin


admin.post('/createadmin',function(req,res){


    let id = req.headers['id'];


     User.findById(id,{email:1},(err,user) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
        
    
    
    let created = moment().add(5.5,'hours').format('YYYY/MM/DD T H:mm:ss');

    let newUser = new User();

    newUser.firstname = req.body.saFirstname ;
    newUser.lastname = req.body.saLastname ;

    newUser.email = req.body.saEmail ;
    newUser.password = req.body.password ;
    
    newUser.category = req.body.userAuthLevel ;

    newUser.createdAt = created ;
    newUser.createdBy = user.email ;
    
    newUser.modify = "super";


    newUser.save(function(err,info){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true
            })
        }
    })

            
        }
    });



})











// Create client


admin.post('/createclient',function(req,res){

    let id = req.headers['id'];


    User.findById(id,{email:1},(err,user) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{



    let created = moment().add(5.5,'hours').format('YYYY/MM/DD T H:mm:ss')

    let newUser = new User();

    newUser.firstname = req.body.ctFirstname ;
    newUser.middlename = req.body.ctMiddlename ;
    newUser.lastname = req.body.ctLastname ;
    newUser.email = req.body.ctEmail ;
    newUser.countrycode = req.body.countryCode;
    newUser.phone = req.body.ctMobile ;
    newUser.password = req.body.password ;
    newUser.category = req.body.userAuthLevel ;

    newUser.shopid = req.body.shopId ;
    newUser.shoprefid = req.body.shoprefid ;
    newUser.createdAt = created;
    newUser.createdBy = user.email ;

    newUser.modify = "super";

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


}

    });

});







// Adding client


admin.post('/addclient',function(req,res){

    let id = req.headers['id'];


    User.findById(id,{email:1},(err,user) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{



    let created = moment().add(5.5,'hours').format('YYYY/MM/DD T H:mm:ss')

    let newUser = new User();

    newUser.firstname = req.body.ctFirstname ;
    newUser.middlename = req.body.ctMiddlename ;
    newUser.lastname = req.body.ctLastname ;
    newUser.email = req.body.ctEmail ;
    newUser.countrycode = req.body.countryCode;
    newUser.phone = req.body.ctMobile ;
    newUser.password = req.body.password ;
    newUser.category = req.body.userAuthLevel ;

    newUser.shopid = req.body.shopId ;
    newUser.shoprefid = req.body.shoprefid ;
    newUser.createdAt = created;
    newUser.createdBy = user.email ;

    newUser.modify = "client";

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


}

    });

});





// Edit client - NEW

admin.post('/editclient',function(req,res){



    let id = req.headers['id'];

    let clientId = req.body.clientId

    User.findById(id,{email:1},(err,user) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{


            let updatedBy = user.email;
            let updatedAt = moment().add(5.5,'hours').format('YYYY/MM/DD T H:mm:ss');

            let oldemail = req.body.ctOldEmail;


            let firstname = req.body.ctFirstname ;
            let middlename = req.body.ctMiddlename ;
            let lastname = req.body.ctLastname ;
            let email = req.body.ctEmail ;
            let countrycode = req.body.countryCode;
            let phone = req.body.ctMobile ;



            if(oldemail == email){


                User.findOneAndUpdate({"_id": clientId},{$set: {"firstname": firstname,"lastname":lastname,"email":email,"middlename":middlename,"countrycode":countrycode,"phone":phone,"updatedBy":updatedBy,"updatedAt":updatedAt}},{safe: true,upsert: true,new: true},function(err,done){
                    if(err){
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        })
                    }else{
                        res.json({
                            status: true
                        })
                    }
                })

            }else if(oldemail != email){

                User.findOne({email: email},(err,info) => {
                    if(err){
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        })
                    }else if(info){
                        res.json({
                            status: false,
                            message: "Email exists already"
                        })
                    }else if(!info){
                        console.log(info)

                         User.findOneAndUpdate({"_id": clientId},{$set: {"firstname": firstname,"lastname":lastname,"email":email,"middlename":middlename,"countrycode":countrycode,"phone":phone,"updatedBy":updatedBy,"updatedAt":updatedAt}},{safe: true,upsert: true,new: true},function(err,done){
                                if(err){
                                    res.json({
                                        status: false,
                                        message: "Error Occured " + err
                                    })
                                }else{
                                    res.json({
                                        status: true
                                    })
                                }
                            })

                    }
                })


       //         
            }else{
                res.json({
                    status: false,
                    message: "Invalid old email"
                })
            }



//

        }
    })


})



// Create  User


admin.post('/createuser',function(req,res){

    let id = req.headers['id'];


    User.findById(id,{email: 1,userid: 1},(err,user) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

    let created = moment().add(5.5,'hours').format('YYYY/MM/DD T H:mm:ss');

    let newUser = new User();

    newUser.firstname = req.body.firstname;

    newUser.firstname = req.body.ctFirstname ;
    newUser.middlename = req.body.ctMiddlename ;
    newUser.lastname = req.body.ctLastname ;
    newUser.email = req.body.ctEmail ;
    newUser.countrycode = req.body.countryCode;
    newUser.phone = req.body.ctMobile ;
    newUser.password = req.body.password ;
    newUser.category = req.body.userAuthLevel ;

    newUser.shopid = req.body.shopId ;
    newUser.shoprefid = req.body.shoprefid ;
    newUser.createdAt = created;

    newUser.createdBy = user.email ;
    newUser.userrefid = user.userid ;

    newUser.modify = "client"

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


        }

    });



});






// // Adding Business - DEPRECATED


// admin.post('/createbusiness',function(req,res){

    
//         let id = req.headers['id'];

//         let id2 = req.body.clientId;

//         let branch = req.body.branch;

//         let companyname = req.body.companyName;

//         let companyaddress = req.body.companyAddress;

//         User.find({_id:id2},{userid:1},(err,userid) => {
//         if(err){
//             res.json({
//                 status: false,
//                 message: "Error Occured " + err
//             })
//         }else{

//             let userId = userid[0].userid ;

//              let api;

//                 if(userId){
//                     api = unique(String(userId));
//                 }else{
//                     api = unique();
//                 }

            
//             // api = jwt.sign(id2,app.get('superSecret'),{
//             //         expiresIn: "365 days"
//             // });


//             if(branch == "main"){


//             var newShop = new Shop();

//             newShop.userid = userId ;

//             newShop.api = api;

            
//             newShop.companyname = companyname;
//             newShop.address = companyaddress ;
//             newShop.city = req.body.city;
//             newShop.state = req.body.state;
//             newShop.zipcode = req.body.zipCode;
//             newShop.countrycode = req.body.countryCode;
//             newShop.phone = req.body.phone;
//             newShop.buttoncolor = req.body.btnTxtColor; 
//             newShop.footercolor = req.body.footerBgColor; 
//             newShop.landingpage = req.body.landingPage;
            
//             newShop.branch = branch
            
//             newShop.save((err,shop) => {
//                 if(err){
//                     res.json({
//                         status: false,
//                         message: "Error Occured " + err
//                     })
//                 }else{

//                     let shopid = shop._id;
//                     let shoprefid = shop.shopid;

//                     User.findByIdAndUpdate(id2,{$set: {"shopid":shopid,"shoprefid":shoprefid}},{safe:true,upsert:true,new:true},(err,done) => {
//                         if(err){
//                             res.json({
//                                 status: false,
//                                 message: "Error Occured " + err
//                             })
//                         }else{
//                             res.json({
//                                 status: true,
//                                 //dummy: shop
//                             })
//                         }
//                     })

                   
//                 }
//             })

// //
//             }else if(branch == "sub"){



//             var newShop = new Shop();

//             newShop.userid = userId ;

//             newShop.api = api;

//             newShop.companyname = companyname ;
//             newShop.address = companyaddress ;
//             newShop.city = req.body.city;
//             newShop.state = req.body.state;
//             newShop.zipcode = req.body.zipCode;
//             newShop.countrycode = req.body.countryCode;
//             newShop.phone = req.body.phone;
//             newShop.buttoncolor = req.body.btnTxtColor; 
//             newShop.footercolor = req.body.footerBgColor; 
//             newShop.landingpage = req.body.landingPage;
            
//             newShop.branch = branch

//             newShop.save((err,shop) => {
//                 if(err){
//                     res.json({
//                         status: false,
//                         message: "Error Occured " + err
//                     })
//                 }else{
//                     res.json({
//                         status: true
//                     })
//                 }
//             })



//             }

//   //                       

//         }



//         })

// })


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


/*

// Adding Customer - sparkpost

admin.post('/addcustomer',function(req,res){

    
    let id = req.headers['id'];

    let shopId = req.body.shop_id;

    let firstname = req.body.c_firstname;
    let lastname = req.body.c_lastname;
    let email = req.body.c_email;
    let phone = req.body.c_mobile;
    let notes = req.body.c_notes;

    let file = path.join(__dirname+'/a.txt') 
    let source = fs.readFileSync(file,'utf-8')

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


*/



// // Add customer - mandrill 



// admin.post('/addcustomer',function(req,res){

    
//     let id = req.headers['id'];

//     let shopId = req.body.shopId;

//     let firstname = req.body.cfirstname;
//     let lastname = req.body.clastname;
//     let email = req.body.cemail;
//     let countrycode = req.body.countryCode
//     let phone = req.body.cmobile;
//     let notes = req.body.cnotes;

//     let frommobile = '17252000019';
//     let tomobile = countrycode + phone;

//     let feedbackDir = path.join(__dirname,'..','..','templates','feedback')
//     let feedback = new EmailTemplate(feedbackDir);


//     Shop.findById(shopId,{companyname:1},(err,company) => {
//         if(err){
//             res.json({
//                 status: false,
//                 message: "Error Occured " + err
//             })
//         }else{
           
//             let companyname = company.companyname;

//             let createdAt = moment().add(5.5,'hours').format('YYYY/MM/DD T H:mm:ss');

//     Shop.findByIdAndUpdate(shopId,{$push:{"customers":{$each:[{firstname: firstname,lastname: lastname,email: email,countrycode: countrycode,phone: phone,notes: notes,createdAt: createdAt}],$position: 0}}},{safe:true,upsert:true,new:true},(err,customer) => {
//         if(err){
//             res.json({
//                 status: false,
//                 message: "Error Occured " + err
//             })
//         }else{

//             let customerid = customer.customers[0]._id;

//             let r1 = 'http://104.197.80.225:8080/opiniion/feedback/1/' + shopId + '/' + customerid ;
//             let r2 = 'http://104.197.80.225:8080/opiniion/feedback/2/' + shopId + '/' + customerid ;

//             let r3 = 'http://104.197.80.225:8080/opiniion/rd/3/' + shopId + '/' + customerid + '/' + 'ChIJ8yjigEuFTYcRde7tEbNvi7Y'

//             let feedurl = 'http://104.197.80.225:8080/opiniion/review/' + shopId + '/' + customerid ;

//             let values = {company1:companyname,username1:firstname,url1:r1,url2:r2,url3:r3,feedurl1:feedurl}
            
//             let text = "Hi " + firstname + " ,We would love to hear your feedback about your shopping experience with us. " + feedurl

//             feedback.render(values,(err,feedresult) => {
//                 if(err){
//                     res.json({
//                         status: false,
//                         message: "Error Occured " + err
//                     })
//                 }else{

//                     let feedhtml = feedresult.html;


//                 // transport.sendMail({
//                 //     from: 'support@opiniionmail.com',
//                 //     to: email,
//                 //     subject: 'Opiniion Feedback',
//                 //     html: feedhtml
//                 // },(err,info) => {
//                 //     if(err){
//                 //         res.json({
//                 //             status: false,
//                 //             message: "Error Occured " + err
//                 //         })
//                 //     }else{


//                 //     nexmo.message.sendSms(frommobile,tomobile,text,(err,response) => {
//                 //     if(err){
//                 //         res.json({
//                 //             status: false,
//                 //             message: "Error Occured " + err
//                 //         })
//                 //     }else{
//                 //         res.json({
//                 //             status: true
//                 //         })
//                 //     }
//                 // })
                    
//                 //     }

//                 // })




//                 let message = {
//                     "html": feedhtml,
//                     "subject": "Opiniion Feedback",
//                     "from_email": "support@opiniionmail.com",
//                     "to": [{
//                         "email": email
//                     }],
//                     "track_opens": true,
//                     "track_clicks": true,

//                 }


//                 mandrillClient.messages.send({"message": message},(result,err) => {
//                     if(result){
//                         let mandrillId = result[0]._id ;
                        
//                         Shop.findOneAndUpdate({"customers._id": customerid},{$set: {"customers.$.mandrillId": mandrillId}},{safe: true,upsert: true,new: true},(err,info) => {
//                             if(err){
//                                 res.json({
//                                     status: false,
//                                     message: "Error Occured " + err
//                                 })
//                             }else{

// // CHECK THIS - CHANGE LATER - CHANGED NOW

//             nexmo.message.sendSms(frommobile,tomobile,text,(err,response) => {
//                     if(err){
//                         res.json({
//                             status: false,
//                             message: "Error Occured " + err
//                         })
//                     }else{
//                         res.json({
//                             status: true
//                         })
//                     }
//                 })

             
                
                                
                                
//                             }
//                         })


//                     }else{
//                         res.json({
//                             status: false,
//                             message: err
//                         })
//                     }
//                 })


//                 }
//             })




//             // res.json({
//             //     status: true,
//             //   //dummy: customer
//             // })
//         }
//     })




//         }
//     })


  

// })








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
                status: false,
                message: "Error Occured " + err
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


admin.post('/getbusinessbyclientid',function(req,res){

    let id = req.headers['id'];

    let clientid = req.body.clientId ;


    User.findById(clientid,(err,user) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
           

            let userid = user.userid;

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



        }
    })

    

    
})


// Update Profile

admin.post('/updateprofile',function(req,res){

    let id = req.headers['id'];

    let firstname = req.body.userFirstname;
    let lastname = req.body.userLastname;
    let email = req.body.userEmail;
    let phone = req.body.userMobile;

    User.findByIdAndUpdate(id,{$set: {"firstname":firstname,"lastname":lastname,"email":email,"phone":phone}},{safe:true,upsert:true,new:true},(err,done) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true
            })
        }
    })

})




// New Password


admin.post('/newpassword',function(req,res){

    let id = req.headers['id'];

    let newPassword = req.body.newPassword;

    User.findById(id,(err,user) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
                User.findByIdAndUpdate(id,{$set:{"password": newPassword,"changepass": "false"}},{safe:true,upsert:true,new:true},(err,done) => {
                    if(err){
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        })
                    }else{
                        res.json({
                            status: true
                        })
                    }
                })
           }
        
    })
   
})




// Change Password


admin.post('/changepassword',function(req,res){

    let id = req.headers['id'];

    let currentPassword = req.body.currentPassword;
    let newPassword = req.body.newPassword;

    User.findById(id,(err,user) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
           if(user.password != currentPassword){
                res.json({
                    status: false,
                    message: "wrongpassword"
                })
           }else{
                User.findByIdAndUpdate(id,{$set:{"password": newPassword}},{safe:true,upsert:true,new:true},(err,done) => {
                    if(err){
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        })
                    }else{
                        res.json({
                            status: true
                        })
                    }
                })
           }
        }
    })
   
})



// Update Profile Picture

admin.post('/updateprofilelogo',function(req,res){

    let id = req.headers['id'];

    userUpload(req,res,function(err){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            User.findByIdAndUpdate(id,{$set: {"userimage": req.files}},{safe:true,upsert:true,new:true},(err,done) => {
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                    res.json({
                        status: true,
                        userimage: req.files[0].filename
                    })
                }
            })
        }
    })


})


// Get Branch by client Id


admin.post('/getbranchbyclientid',function(req,res){

    let id = req.headers['id'];

    let clientid = req.body.clientId

    User.findById(clientid,{"shopid":1},(err,shop) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err 
            })
        }else{
            if(shop.shopid == "null"){
                
                branch = false

                res.json({
                    status: true,
                    message: shop,
                    branch: branch
                })
            }else{

                branch = true

                res.json({
                    status: true,
                    message: shop,
                    branch: branch
                })
                
            }
        }
    })

})


// Get Single Client by client id


admin.post('/getsingleclientbyclientid',function(req,res){


    let id = req.headers['id'];

    let clientid = req.body.clientId;

    User.findById(clientid,{"password":0},(err,user) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                clientdetails: user
            })
        }
    })

})


// Get Business(shop) Ref id by shop id


admin.post('/getbusinessrefidbyshopid',function(req,res){

    let id = req.headers['id'];

    let shopid = req.body.shopId;

    Shop.findById(shopid,{"shopid":1},(err,shop) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            let shoprefid = shop.shopid;

            res.json({
                status: true,
                shoprefid: shoprefid
            })
        }
    })

})





// Get Single Business by shop id

admin.post('/getsinglebusinessbyshopid',function(req,res){

    let id = req.headers['id'];

    let shop_id = req.body.shop_id;

    Shop.findById(shop_id,(err,shop) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            let shoprefid = shop.shopid;

        

    Shop.aggregate([
        {$match: {"shopid":shoprefid}},
        {$lookup: 
        {
            from: "users",
            localField: "shopid",
            foreignField: "shoprefid",
            as: "users"
        }},
        {$project: {
            "shopid":1,"branch":1,"landingpage":1,"footercolor":1,"buttoncolor":1,"phone":1,"countrycode":1,"zipcode":1,"state":1,"city":1,"email":1,"address":1,"companyname":1,"api":1,"logo":1,"rotators":1,"mailactive":1,"messageactive":1,"mailtemplate1subject":1,"mailtemplate1":1,"mailtemplate2":1,"mailtemplate3":1,"mailtemplate4":1,"msgtemplate1":1,"msgtemplate2":1,"msgtemplate3":1,"msgtemplate4":1,"landline1":1,"landline2":1,"landline3":1,"reviewline1":1,"reviewline2":1,"reviewline3":1,"fromname":1,"users": {
                $filter: {
                    input: "$users",
                    as: "usernew",
                    cond: {$eq : ["$$usernew.category","clientuser"]}
                }
            }
        } 
    },
    {$project: {"shopid":1,"branch":1,"landingpage":1,"footercolor":1,"buttoncolor":1,"phone":1,"countrycode":1,"zipcode":1,"state":1,"city":1,"email":1,"address":1,"companyname":1,"api":1,"logo":1,"rotators":1,"mailactive":1,"messageactive":1,"mailtemplate1subject":1,"mailtemplate1":1,"mailtemplate2":1,"mailtemplate3":1,"mailtemplate4":1,"msgtemplate1":1,"msgtemplate2":1,"msgtemplate3":1,"msgtemplate4":1,"landline1":1,"landline2":1,"landline3":1,"reviewline1":1,"reviewline2":1,"reviewline3":1,"fromname":1,"users._id":1,"users.userid":1,"users.phone":1,"users.email":1,"users.lastname":1,"users.firstname":1,"users.userimage":1,"users.countrycode":1,"users.category":1
    }}
    ]).exec((err,shop) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                businessdetails: shop
            })
        }
    })



        }
    })


})


//   Update Client Details


admin.post('/updateclientdetails',function(req,res){

    let id = req.headers['id'];

    let firstname = req.body.firstname;
    let middlename = req.body.middlename;
    let lastname = req.body.lastname;

})



// // Edit Business


// admin.post('/editbusiness',function(req,res){

//     let id = req.headers['id'];

//     let shop_id = req.body.shopId;
    
//     let companyname = req.body.companyName;
//     let state = req.body.state;
//     let city = req.body.city;
//     let address = req.body.address;

//     let phone = req.body.phone;


//     Shop.findByIdAndUpdate(shop_id,{$set: {"companyname": companyname,
// "state": state,"city": city,"address": address,"phone":phone}},{safe:true,upsert: true,new: true},(err,done) => {
//     if(err){
//         res.json({
//             status: false,
//             message: "Error Occured " + err
//         })
//     }else{
//         res.json({
//             status: true
//         })
//     }
// })

// })



// Upload Logo 

admin.post('/updatelogo',function(req,res){

    let id = req.headers['id'];

    let shop_id = req.headers['shop_id'];

    logoupload(req,res,function(err){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            Shop.findByIdAndUpdate(shop_id,{$set: {"logo":req.files}},{safe: true,upsert: true,new: true},(err,done) => {
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                    res.json({
                        status: true,
                        shoplogo: req.files[0].filename
                    })
                }
            })

        }
    })

})





//Get Total engaged users -single

admin.post('/gettotalold',function(req,res){

    let id = req.body.shopId;


    Shop.aggregate([
        {$match: {"shopid":id}},
        {$project: {"_id":0 ,"customers": {$size: "$customers"}}}
    ]).exec(function(err,customers){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: customers
            })
        }
    })



})




// Get negative -- Deprecated

admin.post('/getnegative',function(req,res){


    let id = req.body.shopId
        
    Shop.aggregate([
       {$match: {"shopid":id}},
       {$unwind: "$customers"},
       {$unwind: "$customers.rating"},
       {$match: {$or: [{"customers.rating":"1"},{"customers.rating":"2"}]}},
       {$group: {"_id":null,negative:{$sum:1}}},
       {$project:{"_id":0,"negative":1}}
    ]).exec(function(err,numbers){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            

            res.json({
                status: true,
                message: numbers
            })
        }
    })


})




// Get Total



admin.post('/gettotal',function(req,res){

    
    let shopid = req.body.shopId;

    Shop.aggregate([
        {$match: {"shopid":shopid}},
        {$unwind: "$customers"},
        {$project: {"customers":1}}
    ]).exec((err,submitted) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

           let submittedusers = submitted.length ;

            Shop.aggregate([
                {$match: {"shopid": shopid}},
                {$unwind: "$customers"},
                {$match: {"customers.engagedAt": {$exists: true}}}
            ]).exec((err,engaged) => {
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{

                    let engagedusers = engaged.length

                    
                    Shop.aggregate([
                        {$match: {"shopid": shopid}},
                        {$unwind: "$customers"},
                        {$match: {$or:[{"customers.rating":"1"},{"customers.rating":"2"}]}}
                    ]).exec((err,negative) => {
                        if(err){
                            res.json({
                                status: false,
                                message: "Error Occured " + err
                            })
                        }else{

                            let negativeusers = negative.length;

                            res.json({
                                status: true,
                                submittedusers: submittedusers,
                                engagedusers: engagedusers,
                                negativeusers: negativeusers
                            })
                        }
                    })
                    
                    

                }
            })


        }
    })

})



// Get New Reviews Today


admin.post('/getnewreviews',function(req,res){


    let shopid = req.body.shopId;

    let start = moment().format('YYYY/MM/01')

    let end = moment().add(1,'months').format('YYYY/MM/01')



    // let today = moment().format('YYYY/MM/DD')
    // let tomorrow = moment().add(1,'days').format('YYYY/MM/DD')

    Shop.aggregate([
        {$match: {"shopid": shopid}},
        {$unwind: "$customers"},
        {$match: {"customers.engagedAt": {$gte: start,$lt: end}}}
    ]).exec((err,reviews) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            let newreviews = reviews.length

            res.json({
                status: true,
                newreviews: newreviews
            })
        }
    })


})




//Get total using Time range



admin.post('/gettotaltimerange',function(req,res){


    let shopid = req.body.shopId ;

    let startdate = req.body.startdate ;

    let enddate = req.body.enddate ;



    Shop.aggregate([
        {$match: {"shopid": shopid}},
        {$unwind: "$customers"},
        {$match: {"customers.createdAt":{$gte: startdate,$lte: enddate}}}
    ]).exec(function(err,submitted){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            
            let submittedusers = submitted.length;

            Shop.aggregate([
                {$match: {"shopid": shopid}},
                {$unwind: "$customers"},
                {$match: {"customers.engagedAt": {$gte: startdate,$lte: enddate}}}
            ]).exec((err,engaged) => {
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{

                    let engagedusers = engaged.length ;

                    Shop.aggregate([
                        {$match: {"shopid": shopid}},
                        {$unwind: "$customers"},
                        {$match: {"customers.engagedAt": {$gte: startdate,$lte: enddate}}},
                        {$match: {$or:[{"customers.rating":"1"},{"customers.rating":"2"}]}}
                    ]).exec((err,negative) => {
                        if(err){
                            res.json({
                                status: false,
                                message: "Error Occured " + err
                            })
                        }else{
                            let negativeusers = negative.length;

                            res.json({
                                status: true,
                                submittedusers: submittedusers,
                                engagedusers: engagedusers,
                                negativeusers: negativeusers
                            })
                        }
                    })


                }
            })


        }
    })



})




// GET Total Business


admin.get('/gettotalbusiness',function(req,res){

    Shop.count({},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                totalbusiness: info
            })
        }
    })

})




// ADMIN - GET all business


admin.get('/getallbusiness',function(req,res){

    Shop.aggregate([
        {$lookup: 
        {
            from: "users",
            localField: "userid",
            foreignField: "userid",
            as: "client"
        }},
        {$project: {"phone":1,"countrycode":1,"zipcode":1,"shopid":1,"state":1,"address":1,"userid":1,"companyname":1,"client._id":1}}
    ]).exec((err,data) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                business: data
            })
        }
    })

})



// Add Business



admin.post('/addbusinessnew',function(req,res){

    let id = req.headers['id'];
    let id2 = req.body.clientId;

    let branch = req.body.branch;
    let companyname = req.body.companyName;

    let companyaddress = req.body.companyAddress;

    //

    let obj = req.body.rotators ;           // Getting rotator values
    let key = Object.keys(obj);

    User.find({_id: id2},{userid:1},((err,userid) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            let userId = userid[0].userid;

            let api;


// API with userid
            // if(userId){
            //     api = unique(String(userId));
            // }else{
            //     api = unique();
            // }

            api = unique();

            
            // api = jwt.sign({"userid":userId},app.get('superSecret'),{
            //         expiresIn: "365 days"
            // });



// 
// 



            
            if(branch == "main"){


            var newShop = new Shop();

            newShop.userid = userId ;

            newShop.api = api;

            
            newShop.companyname = companyname;
            newShop.address = companyaddress ;
            newShop.city = req.body.city;
            newShop.state = req.body.state;
            newShop.zipcode = req.body.zipCode;
            newShop.countrycode = req.body.countryCode;
            newShop.phone = req.body.phone;
            newShop.buttoncolor = req.body.btnTxtColor; 
            newShop.footercolor = req.body.footerBgColor; 
            newShop.landingpage = req.body.landingPage;

            newShop.fromname = req.body.emailName ;

            newShop.email = req.body.businessEmail;

            newShop.mailtemplate1 = req.body.mailTemplate1 ;
            newShop.mailtemplate2 = req.body.mailTemplate2 ;
            newShop.mailtemplate3 = req.body.mailTemplate3 ;
            newShop.mailtemplate4 = req.body.mailTemplate4 ;

            newShop.msgtemplate1 = req.body.msgTemplate1 ;
            newShop.mailtemplate1subject = req.body.mailTemplate1subject ;

            newShop.msgtemplate2 = req.body.msgTemplate2 ;
            newShop.msgtemplate3 = req.body.msgTemplate3 ;
            newShop.msgtemplate4 = req.body.msgTemplate4 ;
            
            newShop.landline1 = req.body.landLine1 ;
            newShop.landline2 = req.body.landLine2 ;
            newShop.landline3 = req.body.landLine3 ;

            newShop.reviewline1 = req.body.reviewLine1 ;
            newShop.reviewline2 = req.body.reviewLine2 ;
            newShop.reviewline3 = req.body.reviewLine3 ;

            newShop.mailactive = req.body.mailActive ;
            newShop.messageactive = req.body.messageActive ;

            newShop.branch = branch;

            
            
            newShop.save((err,shop) => {
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{

                    let shop_id = shop._id;
                    let shoprefid = shop.shopid;

                    User.findByIdAndUpdate(id2,{$set: {"shopid":shop_id,"shoprefid":shoprefid}},{safe:true,upsert:true,new:true},(err,done) => {
                        if(err){
                            res.json({
                                status: false,
                                message: "Error Occured " + err
                            })
                        }else{


//  rotator




Shop.findById(shop_id,{"rotatorindex":1},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            let value = info.rotatorindex + 1

            let name;
            let url;
            let positiveurl;

    for(var i=0;i<obj.length;i++){  // start of for

            name = obj[key[i]].name
            url = obj[key[i]].url
            positiveurl = obj[key[i]].positiveurl

    
    
    
    Shop.findByIdAndUpdate(shop_id,{$set:{"rotatorindex":value},$push:{"rotators":{$each:[{name:name,url:url,positiveurl:positiveurl}],$position:0}}},{safe:true,upsert:true,new:true},function(err,rotator){
    
    
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            console.log("rotator added")
        }
    })

        }   // end of for 

        }
    })


                            res.json({
                                status: true,
                                shop_id: shop_id
                                //dummy: shop
                            })



                        }
                    })

                   
                }
            })

// SUB 
            }else if(branch == "sub"){



            var newShop = new Shop();

            newShop.userid = userId ;

            newShop.api = api;

            newShop.companyname = companyname ;
            newShop.address = companyaddress ;
            newShop.city = req.body.city;
            newShop.state = req.body.state;
            newShop.zipcode = req.body.zipCode;
            newShop.countrycode = req.body.countryCode;
            newShop.phone = req.body.phone;
            newShop.buttoncolor = req.body.btnTxtColor; 
            newShop.footercolor = req.body.footerBgColor; 
            newShop.landingpage = req.body.landingPage;

            newShop.fromname = req.body.emailName ;

            newShop.email = req.body.businessEmail;

            newShop.mailtemplate1 = req.body.mailTemplate1 ;
            newShop.mailtemplate1subject = req.body.mailTemplate1subject ;
            
            
            newShop.mailtemplate2 = req.body.mailTemplate2 ;
            newShop.mailtemplate3 = req.body.mailTemplate3 ;
            newShop.mailtemplate4 = req.body.mailTemplate4 ;

            newShop.msgtemplate1 = req.body.msgTemplate1 ;
            newShop.msgtemplate2 = req.body.msgTemplate2 ;
            newShop.msgtemplate3 = req.body.msgTemplate3 ;
            newShop.msgtemplate4 = req.body.msgTemplate4 ;

            newShop.landline1 = req.body.landLine1 ;
            newShop.landline2 = req.body.landLine2 ;
            newShop.landline3 = req.body.landLine3 ;

            newShop.reviewline1 = req.body.reviewLine1 ;
            newShop.reviewline2 = req.body.reviewLine2 ;
            newShop.reviewline3 = req.body.reviewLine3 ;

            newShop.mailactive = req.body.mailActive ;
            newShop.messageactive = req.body.messageActive ;
            
            newShop.branch = branch

            newShop.save((err,shop) => {
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{

                        let shop_id = shop._id;

// rotator start
                    Shop.findById(shop_id,{"rotatorindex":1},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            let value = info.rotatorindex + 1

            let name;
            let url;
            let positiveurl;

    for(var i=0;i<obj.length;i++){  // start of for

            name = obj[key[i]].name
            url = obj[key[i]].url
            positiveurl = obj[key[i]].positiveurl

    
    
    
    Shop.findByIdAndUpdate(shop_id,{$set:{"rotatorindex":value},$push:{"rotators":{$each:[{name:name,url:url,positiveurl:positiveurl}],$position:0}}},{safe:true,upsert:true,new:true},function(err,rotator){
    
    
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            console.log("rotator added")
        }
    })

        }   // end of for 

        }
    })



                    res.json({
                        status: true,
                        shop_id: shop_id
                    })
                }
            })



            }
//





        }
    }))



})





//Edit Business - NEW


admin.post('/editbusinessnew',function(req,res){

    let id = req.headers['id'];

    let shop_id = req.body.shop_id;

    let companyname = req.body.companyName;
    let state = req.body.state;
    let city = req.body.city;
    let address = req.body.companyAddress;
    let zipcode = req.body.zipCode;

    let countrycode = req.body.countrycode ;
    let phone = req.body.phone;

    let buttoncolor = req.body.btnTxtColor;
    let footercolor = req.body.footerBgColor; 
    let landingpage = req.body.landingPage;

    let fromname = req.body.emailName ;

    let email = req.body.businessEmail ;

    let mailtemplate1 = req.body.mailTemplate1 ;
    let mailtemplate1subject = req.body.mailTemplate1subject ;

    let mailtemplate2 = req.body.mailTemplate2 ;
    let mailtemplate3 = req.body.mailTemplate3 ;
    let mailtemplate4 = req.body.mailTemplate4 ;

    let msgtemplate1 = req.body.msgTemplate1 ;
    let msgtemplate2 = req.body.msgTemplate2 ;
    let msgtemplate3 = req.body.msgTemplate3 ;
    let msgtemplate4 = req.body.msgTemplate4 ;

    let landline1 = req.body.landLine1 ;
    let landline2 = req.body.landLine2 ;
    let landline3 = req.body.landLine3 ;

    let reviewline1 = req.body.reviewLine1 ;
    let reviewline2 = req.body.reviewLine2 ;
    let reviewline3 = req.body.reviewLine3 ;



   

    let obj = req.body.rotators ;
    let key = Object.keys(obj);


    Shop.findByIdAndUpdate(shop_id,{$set: {"companyname":companyname,"state":state,"city":city,"address":address,"zipcode":zipcode,"countrycode":countrycode,"phone":phone,"buttoncolor":buttoncolor,"footercolor":footercolor,"landingpage":landingpage,"fromname":fromname,"email":email,"mailtemplate1":mailtemplate1,"mailtemplate1subject": mailtemplate1subject,"mailtemplate2":mailtemplate2,"mailtemplate3":mailtemplate3,"mailtemplate4":mailtemplate4,"msgtemplate1":msgtemplate1,"msgTemplate2":msgtemplate2,"msgtemplate3":msgtemplate3,"msgtemplate4":msgtemplate4,"landline1":landline1,"landline2":landline2,"landline3":landline3,"reviewline1":reviewline1,"reviewline3":reviewline3,"rotators":[]}},{safe:true,upsert:true,new:true},(err,done) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
           
           let name;
           let url;
           let positiveurl

            for(var i=0;i<obj.length;i++){  // start of for

            name = obj[key[i]].name
            url = obj[key[i]].url
            positiveurl = obj[key[i]].positiveurl
            

    
    
    
    Shop.findByIdAndUpdate(shop_id,{$push:{"rotators":{$each:[{name:name,url:url,positiveurl:positiveurl}],$position:0}}},{safe:true,upsert:true,new:true},function(err,rotator){
    
    
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            console.log("rotator added")
        }
    })

        }   // end of for 


        res.json({
            status: true
        })


        }
    })

        




})







// // Add customer - NEW


// admin.post('/addcustomernew',function(req,res){


//     let id = req.headers['id'];

//     let shopId = req.body.shop_id;

//     let firstname = req.body.cfirstname;
//     let lastname = req.body.clastname;
//     let email = req.body.cemail;
//     let countrycode = req.body.countryCode
//     let phone = req.body.cmobile;
//     let notes = req.body.cnotes;

//     let frommobile = '17252000019';
//     let tomobile = countrycode + phone;



//       Shop.findById(shopId,{companyname:1,shopid:1,mailtemplate1:1,msgtemplate1:1},(err,company) => {
//         if(err){
//             res.json({
//                 status: false,
//                 message: "Error Occured " + err
//             })
//         }else{
           
//             let companyname = company.companyname;
//             let shoprefid = company.shopid;

//             let source = company.mailtemplate1;

//             let textsource = company.msgtemplate1 ;

//             let createdAt = moment().add(5.5,'hours').format('YYYY/MM/DD T H:mm:ss');

//     Shop.findByIdAndUpdate(shopId,{$push:{"customers":{$each:[{firstname: firstname,lastname: lastname,email: email,countrycode: countrycode,phone: phone,notes: notes,createdAt: createdAt}],$position: 0}}},{safe:true,upsert:true,new:true},(err,customer) => {
//         if(err){
//             res.json({
//                 status: false,
//                 message: "Error Occured " + err
//             })
//         }else{

//             let customerid = customer.customers[0]._id;

//             let template = hbs.compile(source);

//             let url = 'http://104.197.80.225:8080/opiniion/review/' + shoprefid + '/' + customerid ;

//             let context = {url: url}

//             let html = template(context);

//             // let url = 'http://127.0.0.1:4200/review/' + shoprefid + '/' + customerid



            

           

            

           

//             // let r1 = 'http://104.197.80.225:8080/opiniion/feedback/1/' + shoprefid + '/' + customerid ;
//             // let r2 = 'http://104.197.80.225:8080/opiniion/feedback/2/' + shoprefid + '/' + customerid ;

//             // let r3 = 'http://104.197.80.225:8080/opiniion/rd/3/' + shoprefid + '/' + customerid + '/' + 'ChIJ8yjigEuFTYcRde7tEbNvi7Y'

           

//             // let values = {company1:companyname,username1:firstname,url1:r1,url2:r2,url3:r3,feedurl1:feedurl}
            
//             // let text = "Hi " + firstname + " ,We would love to hear your feedback about your shopping experience with us. " + url


            
//                 let text = textsource + " " + url ;



//                 let message = {
//                     "html": html,
//                     "subject": "Opiniion Feedback",
//                     "from_email": "support@opiniionmail.com",
//                     "to": [{
//                         "email": email
//                     }],
//                     "track_opens": true,
//                     "track_clicks": true,

//                 }


//                 mandrillClient.messages.send({"message": message},(result,err) => {
//                     if(result){
//                         let mandrillId = result[0]._id ;
                        
//                         Shop.findOneAndUpdate({"customers._id": customerid},{$set: {"customers.$.mandrillId": mandrillId}},{safe: true,upsert: true,new: true},(err,info) => {
//                             if(err){
//                                 res.json({
//                                     status: false,
//                                     message: "Error Occured " + err
//                                 })
//                             }else{

// // CHECK THIS - CHANGE LATER - CHANGED NOW

//             nexmo.message.sendSms(frommobile,tomobile,text,(err,response) => {
//                     if(err){
//                         res.json({
//                             status: false,
//                             message: "Error Occured " + err
//                         })
//                     }else{
//                         res.json({
//                             status: true
//                         })
//                     }
//                 })                      
                                
//                             }
//                         })


//                     }else{
//                         res.json({
//                             status: false,
//                             message: err
//                         })
//                     }
//                 })


            

           
//         }
//     })


//         }
//     })

// })






//  GET Shop image by Shop_ID

admin.post('/getshopimagebyshopid',function(req,res){

    let id = req.headers['id'];

    let shop_id = req.body.shop_id
 
    Shop.findById(shop_id,{"logo":1},(err,info) => {
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





// View Super admins - GET


admin.get('/viewsuperadmins',function(req,res){

    let id = req.headers['id'];

    User.find({"category":"superadmin"},{"firstname":1,"lastname":1,"email":1,"access":1},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                superadmins: info
            })
        }
    })    


})






// // Grant Access

// admin.post('/grantpermissionaccess',function(req,res){

//     let id = req.headers['id'];

//     let userid = req.body.user_id;

//     User.findByIdAndUpdate(userid,{$set:{"access":"granted"}},{safe: true,upsert: true,new: true},(err,done) => {
//         if(err){
//             res.json({
//                 status: false,
//                 message: "Error Occured " + err
//             })
//         }else{
//             res.json({
//                 status: true,
//                 message: "Access granted"
//             })
//         }
//     })

// })



// Permission acceess

admin.post('/permissionaccess',function(req,res){

    let id = req.headers['id'];

    let userid = req.body.user_id;
    let permission = req.body.permission

    User.findById(userid,(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            if(info.modify == "never"){
                res.json({
                    status: false,
                    message: "You don't have permission to change right of this user"
                })
            }else{
                User.findByIdAndUpdate(userid,{$set:{"access":permission}},{safe: true,upsert: true,new: true},(err,done) => {
                    if(err){
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        })
                    }else{
                        res.json({
                            status: true,
                            message: "Access changed"
                        })
                    }
                })

            }


        } 

    })

})







// Add customer - NEW 2


admin.post('/addcustomernew2',function(req,res){


    let id = req.headers['id'];

    let shopId = req.body.shop_id;

    let firstname = req.body.cfirstname;
    let lastname = req.body.clastname;
    let email = req.body.cemail;
    let countrycode = req.body.countryCode
    let phone = req.body.cmobile;
    let notes = req.body.cnotes;

    let frommobile = '17252000019';
    let tomobile = countrycode + phone;


    let feedbackDir = path.join(__dirname,'..','..','templates','feedback3')
    let feedback3 = new EmailTemplate(feedbackDir);

      Shop.findById(shopId,{companyname:1,shopid:1,mailtemplate1:1,msgtemplate1:1,logo:1,fromname:1,buttoncolor:1,footercolor:1,mailactive:1,messageactive:1,mailtemplate1subject:1,email:1},(err,company) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{


            let logoimage = company.logo[0].filename;

            let opiniionpath = path.join(__dirname,'..','..','public','shoplogo',logoimage);

            let opiniionBuf = fs.readFileSync(opiniionpath);    

            let opiniionContent = opiniionBuf.toString('base64');


            let fromname = company.fromname ;
    
           
            let companyname = company.companyname;
            let shoprefid = company.shopid;

            let source = company.mailtemplate1;

            let subject = company.mailtemplate1subject ;

            let textsource = company.msgtemplate1 ;
            let buttoncolor = company.buttoncolor ;
            let footercolor = company.footercolor ;

            let mailactive = company.mailactive;
            let messageactive = company.messageactive;

            let replyemail = company.email;

            let createdAt = moment().add(5.5,'hours').format('YYYY/MM/DD T H:mm:ss');

            

    Shop.findByIdAndUpdate(shopId,{$push:{"customers":{$each:[{firstname: firstname,lastname: lastname,email: email,countrycode: countrycode,phone: phone,notes: notes,createdAt: createdAt}],$position: 0}}},{safe:true,upsert:true,new:true},(err,customer) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            //else 1




        function Mail(){



            feedback3.render(values,(err,feedresult) => {
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{

                    let feedhtml = feedresult.html;



                let message = {
                    "html": feedhtml,
                    "subject": subject,
                    "from_email": "no-reply@opiniionmail.com",                   //support@opiniionmail.com
                    "from_name": fromname,
                    "to": [{
                        "email": email
                    }],
                    "headers": {
                    "Reply-To": replyemail
                    },
                    "images": [{
                    'type': 'image/png',
                    'name': logoimage,
                    'content': opiniionContent
                    }],
                    "track_opens": true,
                    "track_clicks": true,
                }


                mandrillClient.messages.send({"message": message},(result,err) => {
                    if(result){
                        let mandrillId = result[0]._id ;
                        
                        Shop.findOneAndUpdate({"customers._id": customerid},{$set: {"customers.$.mandrillId": mandrillId}},{safe: true,upsert: true,new: true},(err,info) => {
                            if(err){
                                res.json({
                                    status: false,
                                    message: "Error Occured " + err
                                })
                            }else{

                        res.json({
                            status: true
                        })
                                        
                  // final              
                            }
                        })


                    }else{
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        })
                    }
                })


                }
            })

            ///Mail

        }


// Message

        function Message(){


            nexmo.message.sendSms(frommobile,tomobile,text,(err,response) => {
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

                        
                        connection.query('INSERT INTO link SET url = ?,shortened = ?,shorturl = ?',[url,shortened,shorturl],(err,info) => {
                            if(err){
                                res.json({
                                    status: false,
                                    message: "Error in connecting Database"
                                })
                            }else{
                                res.json({
                                    status: true
                                })
                            }
                        })

                            connection.release()
                        })





                        // res.json({
                        //     status: true
                        // })
                    }
                })


            /// Message

        }


        function mailMessage(){



            feedback3.render(values,(err,feedresult) => {
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{

                    let feedhtml = feedresult.html;



                let message = {
                    "html": feedhtml,
                    "subject": subject,
                    "from_email": "no-reply@opiniionmail.com",                   //support@opiniionmail.com
                    "from_name": fromname,
                    "to": [{
                        "email": email
                    }],
                    "headers": {
                    "Reply-To": replyemail
                    },
                    "images": [{
                    'type': 'image/png',
                    'name': logoimage,
                    'content': opiniionContent
                    }],
                    "track_opens": true,
                    "track_clicks": true,
                }


                mandrillClient.messages.send({"message": message},(result,err) => {
                    if(result){
                        let mandrillId = result[0]._id ;
                        
                        Shop.findOneAndUpdate({"customers._id": customerid},{$set: {"customers.$.mandrillId": mandrillId}},{safe: true,upsert: true,new: true},(err,info) => {
                            if(err){
                                res.json({
                                    status: false,
                                    message: "Error Occured " + err
                                })
                            }else{


            nexmo.message.sendSms(frommobile,tomobile,text,(err,response) => {
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

                        
                        connection.query('INSERT INTO link SET url = ?,shortened = ?,shorturl = ?',[url,shortened,shorturl],(err,info) => {
                            if(err){
                                res.json({
                                    status: false,
                                    message: "Error in connecting Database"
                                })
                            }else{
                                res.json({
                                    status: true
                                })
                            }
                        })

                            connection.release()
                        })


                        // res.json({
                        //     status: true
                        // })
                    }
                })

                                        
                  // final              
                            }
                        })


                    }else{
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        })
                    }
                })


                }
            })




        }
        



            let customerid = customer.customers[0]._id;


        let r1 = 'http://104.197.80.225:8080/opiniionnew/feedback/1/' + shoprefid + '/' + customerid ;

        let r2 = 'http://104.197.80.225:8080/opiniionnew/feedback/2/' + shoprefid + '/' + customerid ;

        let r3 = 'http://104.197.80.225:8080/opiniionnew/rd/3/' + shoprefid + '/' + customerid ;

        let r4 = 'http://104.197.80.225:8080/opiniionnew/rd/4/' + shoprefid + '/' + customerid ;

        let r5 = 'http://104.197.80.225:8080/opiniionnew/rd/5/' + shoprefid + '/' + customerid ;


        let url = 'http://104.197.80.225:8080/opiniionnew/review/' + shoprefid + '/' + customerid ;

        let shortened =  shortid.generate()

        let shorturl = "http://www.opni.in/" + shortened
            

            // let url = 'http://127.0.0.1:4200/review/' + shoprefid + '/' + customerid

           

        let values = {source1: source,url1: r1,url2: r2,url3: r3,url4: r4,url5: r5,logoimage1: logoimage,buttoncolor1: buttoncolor,footercolor1: footercolor,companyname1: companyname}

            
            // let text = "Hi " + firstname + " ,We would love to hear your feedback about your shopping experience with us. " + url

// Text message
            
         let text = textsource + " " + shorturl ;



        if(mailactive == "true" && messageactive == "true"){
            mailMessage()
        }else if(mailactive == "true"){
            Mail()
        }else if(messageactive == "true"){
            Message()
        }else{    
            res.json({
                status: true
            })
        } 



        
           
           // End of else 1     
           
        }
    })


        }
    })

})










// // Add customer - NEW 2 old


// admin.post('/addcustomernew2old',function(req,res){


//     let id = req.headers['id'];

//     let shopId = req.body.shop_id;

//     let firstname = req.body.cfirstname;
//     let lastname = req.body.clastname;
//     let email = req.body.cemail;
//     let countrycode = req.body.countryCode
//     let phone = req.body.cmobile;
//     let notes = req.body.cnotes;

//     let frommobile = '17252000019';
//     let tomobile = countrycode + phone;


//     let feedbackDir = path.join(__dirname,'..','..','templates','feedback3')
//     let feedback3 = new EmailTemplate(feedbackDir);

//       Shop.findById(shopId,{companyname:1,shopid:1,mailtemplate1:1,msgtemplate1:1,logo:1,fromname:1,buttoncolor:1},(err,company) => {
//         if(err){
//             res.json({
//                 status: false,
//                 message: "Error Occured " + err
//             })
//         }else{


//             let logoimage = company.logo[0].filename;

//             let opiniionpath = path.join(__dirname,'..','..','public','shoplogo',logoimage);

//             let opiniionBuf = fs.readFileSync(opiniionpath);    

//             let opiniionContent = opiniionBuf.toString('base64');


//             let fromname = company.fromname ;
    
           
//             let companyname = company.companyname;
//             let shoprefid = company.shopid;

//             let source = company.mailtemplate1;

//             let textsource = company.msgtemplate1 ;
//             let buttoncolor = company.buttoncolor ;


//             let createdAt = moment().add(5.5,'hours').format('YYYY/MM/DD T H:mm:ss');

//     Shop.findByIdAndUpdate(shopId,{$push:{"customers":{$each:[{firstname: firstname,lastname: lastname,email: email,countrycode: countrycode,phone: phone,notes: notes,createdAt: createdAt}],$position: 0}}},{safe:true,upsert:true,new:true},(err,customer) => {
//         if(err){
//             res.json({
//                 status: false,
//                 message: "Error Occured " + err
//             })
//         }else{

//             let customerid = customer.customers[0]._id;


//         let r1 = 'http://104.197.80.225:8080/opiniion/feedback/1/' + shoprefid + '/' + customerid ;

//         let r2 = 'http://104.197.80.225:8080/opiniion/feedback/2/' + shoprefid + '/' + customerid ;

//         let r3 = 'http://104.197.80.225:8080/opiniion/rd/3/' + shoprefid + '/' + customerid ;

//         let r4 = 'http://104.197.80.225:8080/opiniion/rd/4/' + shoprefid + '/' + customerid ;

//         let r5 = 'http://104.197.80.225:8080/opiniion/rd/5/' + shoprefid + '/' + customerid ;


//         let url = 'http://104.197.80.225:8080/opiniion/review/' + shoprefid + '/' + customerid ;

            

//             // let url = 'http://127.0.0.1:4200/review/' + shoprefid + '/' + customerid

           

//         let values = {source1: source,url1: r1,url2: r2,url3: r3,url4: r4,url5: r5,logoimage1: logoimage,buttoncolor1: buttoncolor,companyname1: companyname}

            
//             // let text = "Hi " + firstname + " ,We would love to hear your feedback about your shopping experience with us. " + url


            
//         let text = textsource + " " + url ;

        
//            feedback3.render(values,(err,feedresult) => {
//                 if(err){
//                     res.json({
//                         status: false,
//                         message: "Error Occured " + err
//                     })
//                 }else{

//                     let feedhtml = feedresult.html;



//                 let message = {
//                     "html": feedhtml,
//                     "subject": "Opiniion Feedback",
//                     "from_email": "no-reply@opiniionmail.com",                   //support@opiniionmail.com
//                     "from_name": fromname,
//                     "to": [{
//                         "email": email
//                     }],
//                     "images": [{
//                     'type': 'image/png',
//                     'name': logoimage,
//                     'content': opiniionContent
//                     }],
//                     "track_opens": true,
//                     "track_clicks": true,
//                 }


//                 mandrillClient.messages.send({"message": message},(result,err) => {
//                     if(result){
//                         let mandrillId = result[0]._id ;
                        
//                         Shop.findOneAndUpdate({"customers._id": customerid},{$set: {"customers.$.mandrillId": mandrillId}},{safe: true,upsert: true,new: true},(err,info) => {
//                             if(err){
//                                 res.json({
//                                     status: false,
//                                     message: "Error Occured " + err
//                                 })
//                             }else{


//             nexmo.message.sendSms(frommobile,tomobile,text,(err,response) => {
//                     if(err){
//                         res.json({
//                             status: false,
//                             message: "Error Occured " + err
//                         })
//                     }else{
//                         res.json({
//                             status: true
//                         })
//                     }
//                 })

                                        
                                
//                             }
//                         })


//                     }else{
//                         res.json({
//                             status: false,
//                             message: "Error Occured " + err
//                         })
//                     }
//                 })


//                 }
//             })

                
           
//         }
//     })


//         }
//     })

// })








// Get Negative Reviews


admin.get('/getnegativereviews',function(req,res){

    let shopid = req.headers['shopid'];
  

    Shop.aggregate([
        {$match: {"shopid": shopid}},
        {$unwind: "$customers"},
        {$match: {$or: [{"customers.rating":"1"},{"customers.rating":"2"}]}},
        {$group: {_id: "$_id",customers: {$push: {"createdAt":"$customers.createdAt","notes":"$customers.notes","phone":"$customers.phone","countrycode":"$customers.countrycode","email":"$customers.email","lastname":"$customers.lastname","firstname":"$customers.firstname","_id":"$customers._id","feedback":"$customers.feedback","rating":"$customers.rating","mansdrillId":"$customers.mandrillId","engagedAt":"$customers.engagedAt"}}}}
    ]).exec((err,negative) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                negativereviews: negative
            })
        }
    })


})






// Get client users by client admin id


admin.get('/getclientusersbyclientid',function(req,res){

    let userid = req.headers['userid'];

    
    User.find({"userrefid":userid},{"userid":1,"createdBy":1,"createdAt":1,"category":1,"phone":1,"email":1,"lastname":1,"firstname":1,"acceess":1,"userimage":1,"shoprefid":1,"shopid":1,"countrycode":1},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                businessusers: info
            })
        }
    })

})





// Mail Message Access


admin.post('/mailmessagepermission',function(req,res){

    let shopid = req.body.shop_id

    let mailactive = req.body.mailActive ;
    let messageactive = req.body.messageActive ;

    Shop.findByIdAndUpdate(shopid,{$set:{"mailactive":mailactive,"messageactive":messageactive}},{safe: true,upsert: true,new: true},(err,info) => {
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true
            })
        }
    })



})




// positive reviews


opiniion.get('/positivereviews',function(req,res){

    // let url = req.body.url;

    let url = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4&key=AIzaSyDkkoN28SzEXK_kgbskL5dtjr2Sw2KoSWE'


            
            axios.get(url)
                .then(function (response) {
                    // return reviews = response.data.result.reviews
                    return reviews = response.data
                })
                .then(function (reviews){
                    res.json({
                        reviews: reviews
                    })
                })
                .catch(function (error) {
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                });


        

})


// Not Working - Keep for later

opiniion.post('/rotatepro',function(req,res){

    let shopid = req.headers['shopid']

    Shop.findById(shopid,{"rotators.positiveurl":1})
        .then(function(info){
           return info 
        })
        .then(function(info){        
                   for(i=0;i<info.rotators.length;i++){
                        url = info.rotators[i].positiveurl 
                        return response = axios.get(url)
                   }
                   res.json({
                       status: true,
                       response: response.data
                   })
        })
        // .then(function (response) {
        //     // return reviews = response.data.result.reviews
        //     return reviews = response.data
        // })
        // .then(function (reviews){
        //     res.json({
        //         reviews: reviews
        //     })
        // }) 
        .catch(function(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        })

})









app.use('/opiniion/api',admin);












}


