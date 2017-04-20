var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var moment = require('moment');
var multer = require('multer');
var mime = require('mime');
var nodemailer = require('nodemailer');
var request = require('request');


// var beanStream = require('beanstream-node')('merchantId','Payments API key','Profiles API key','Reporting API key');

var pool = require('../connection');


var merchantId = '300204285' ;
var passcode = 'a851fb7B1a1E435eB457Ec95287848Eb' ;  //payment

var beanstream = require('beanstream-node')(merchantId,passcode);


//Ticksum Image

var ticksumstorage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, "C:/wamp64/www/vagan/assets/img/post_images");
    },
    filename: function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
})

var ticksumupload = multer({
    storage: ticksumstorage
}).fields([{
    name: 'ticket_image_front', maxCount: 1
},{
    name: 'ticket_image_back', maxCount: 1
},{
    name: 'licence_image_front', maxCount: 1
},{
    name: 'licence_image_back', maxCount: 1
},{
    name: 'ticket_sign_image', maxCount: 1
},{
    name: 'nia_sign_image', maxCount: 1
},{
    name: 'consent_sign_image', maxCount: 1
},{
    name: 'document_image_1', maxCount: 1
},{
    name: 'document_image_2', maxCount: 1
},{
    name: 'document_image_3', maxCount: 1
},{
    name: 'document_image_4', maxCount: 1
},{
    name: 'document_image_5', maxCount: 1
}])


// User Image

var userStorage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"C:/wamp64/www/vagan/assets/img/user_images");
    },
    filename: function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
})

var userUpload = multer({
    storage: userStorage
}).array('user_image',1);



var pass = "Noble_1234";




var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "movehaul.developer@gmail.com",
        pass: pass
    }
})










module.exports = function(app){




var vagan = express.Router();





/*

var cardPayment = {
    order_number: 'order-abc1234',
    amount:10.00,
    payment_method:'card',
    card:{
        name:'John Doe',
        number:'5100000010001004',
        expiry_month:'02',
        expiry_year:'19',
        cvd:'123',
        complete: true
  }
};

*/





//caia2


vagan.post('/caia',function(req,res){

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }

        var str = req.body.str;
        
        var find = req.body.find;
        var repl = req.body.repl;

        //SELECT * FROM caia2 WHERE offence REGEXP ?

    // connection.query('UPDATE caia2 SET offence = REPLACE(offence,?,?)',[find,repl],function(err,details){
    //     if(err){
    //         res.json({
    //             status: false,
    //             message: "Error Occured " + err
    //         })
    //     }else{
    //         res.json({
    //             status: true,
    //             message: details
    //         })
    //     }
    // })

    connection.query('SELECT offence FROM caia2 WHERE offence REGEXP ?',[str],function(err,off){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: off
            })
        }
    })




        connection.release();
    })

})



















// Vagan Signup

vagan.post('/signup',function(req,res){

    var created = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss a');

    var mobile = req.body.mobile;
    var password = req.body.password;
    var email = req.body.email;
    var apartment_no = req.body.apartment_no;
    var streetname = req.body.streetname;
    var city = req.body.city;
    var province = req.body.province;
    var postal_code = req.body.postal_code;

    var signup = {user_mobile: mobile,user_password: password,user_email: email,apartment_no: apartment_no,streetname: streetname,city: city,province: province,postal_code: postal_code,created_on: created};

    
    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            });
        }


    connection.query('SELECT user_mobile FROM userdetails WHERE user_mobile = ?',[mobile],function(err,mobilever){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else if(mobilever.length == 1){
            res.json({
                status: false,
                message: "Mobile number exists already"
            })
        }else if(mobilever.length != 1){

            connection.query('SELECT user_email FROM userdetails WHERE user_email = ?',[email],function(err,emailver){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else if(emailver.length == 1){
                    res.json({
                        status: false,
                        message: "Email exists already"
                    })
                }else if(emailver.length != 1){




                connection.query('INSERT INTO userdetails SET?',signup,function(err,user){
                    if(err){
                        res.json({
                            status: false,
                            message: "Error Occured " + err
                        });
                    }else{
                        res.json({
                            status: true,
                            message: "You have successfully registered with Vagan"
                        })
                    }
                });





                }
            })
        }
    })






        connection.release();
    })

})


//Post without signup

vagan.post('/post',function(req,res){

    var id = req.headers['id'];
    
    var first_name = req.headers['first_name'];
    var middle_name = req.headers['middle_name'];
    var last_name = req.headers['last_name'];
    var email = req.headers['email'];
    var mobile = req.headers['mobile'];
    var court_date_type = req.headers['court_date_type'];
    var court_date = req.headers['court_date'];
    var court_name = req.headers['court_name'];
    var court_address = req.headers['court_address'];
    var icon_number = req.headers['icon_number'];
    var offence_number = req.headers['offence_number'];
    var offence_date = req.headers['offence_date'];
    var offence_commitof = req.headers['offence_commitof'];
    var contrary_to = req.headers['contrary_to'];
    var section = req.headers['section'];
    var vehicle_type = req.headers['vehicle_type'];
    var fine_amount = req.headers['fine_amount'];
    var ticket_details = req.headers['ticket_details'];
    var ticket_back_side = req.headers['ticket_back_side'];
    var retainer_name = req.headers['retainer_name'];
    var location = req.headers['location'];
    
    var created = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss a');
    var ticket_status = "Ticket Received";

    pool.getConnection(function(err,connection){

        if(err) throw err ;



        ticksumupload(req,res,function(err){
            if(err){
                res.json({
                    status: false,
                    message: "Error Occured " + err
                });
            }else{

//
            if(req.files.ticket_image_front == undefined){
//ticket_image_front
                function ticketFront(){
                    return ticket_image_front = null;
                }
                var ticket_image_front = ticketFront();
            }else if(req.files.ticket_image_front.length == 1){
                function ticketFront(){
                    if(typeof req.files.ticket_image_front[0].filename !== undefined){
                        return ticket_image_front = req.files.ticket_image_front[0].filename
                    }
                }
                var ticket_image_front = ticketFront();
            }else{
                console.log("No Ticket Front image has been added");
            }



//
            if(req.files.ticket_image_back == undefined){
//ticket_image_back
            function ticketBack(){
                return ticket_image_back = null;
            }
                var ticket_image_back = ticketBack();
        }else if(req.files.ticket_image_back.length == 1){
            function ticketBack(){
                if(typeof req.files.ticket_image_back[0].filename !== undefined){
                    return ticket_image_back = req.files.ticket_image_back[0].filename
                }
            }
            var ticket_image_back = ticketBack();
        }else{
            console.log("No Ticket Back Image has been added");
        }


//
        if(req.files.licence_image_front == undefined){
//licence_image_front
            function licenceFront(){
                return licence_image_front = null;
            }
            var licence_image_front = licenceFront();
        }else if(req.files.licence_image_front.length == 1){
            function licenceFront(){
                if(typeof req.files.licence_image_front[0].filename !== undefined){
                    return licence_image_front = req.files.licence_image_front[0].filename
                }
            }
            var licence_image_front = licenceFront();
        }else{
            console.log("No Licence Front Image has been added");
        }



//
        if(req.files.licence_image_back == undefined){
//licence_image_back
            function licenceBack(){
                return licence_image_back = null;
            }
            var licence_image_back = licenceBack();
        }else if(req.files.licence_image_back.length == 1){
            function licenceBack(){
                if(typeof req.files.licence_image_back[0].filename !== undefined){
                    return licence_image_back = req.files.licence_image_back[0].filename
                }
            }
            var licence_image_back = licenceBack();
        }else{
            console.log("No Licence Back Image has been added");
        }


//
        if(req.files.ticket_sign_image == undefined){
//ticket_sign_image
            function ticketSign(){
                return ticket_sign_image = null;
            }
            var ticket_sign_image = ticketSign();
        }else if(req.files.ticket_sign_image.length == 1){
            function ticketSign(){
                if(typeof req.files.ticket_sign_image[0].filename !== undefined){
                    return ticket_sign_image = req.files.ticket_sign_image[0].filename
                }
            }
            var ticket_sign_image = ticketSign();
        }else{
            console.log("No Ticket Sign Image has been added");
        }

//
        if(req.files.nia_sign_image == undefined){
//nia_sign_image
            function niaSign(){
                return nia_sign_image = null;
            }
            var nia_sign_image = niaSign();
        }else if(req.files.nia_sign_image.length == 1){
            function niaSign(){
                if(typeof req.files.nia_sign_image[0].filename !== undefined){
                    return nia_sign_image = req.files.nia_sign_image[0].filename
                }
            }
            var nia_sign_image = niaSign();
        }else{
            console.log("No Nia Sign Image has been added")
        }

//
        if(req.files.consent_sign_image == undefined){
//consent_sign_image
            function consentSign(){
                return consent_sign_image = null;
            }
            var consent_sign_image = consentSign();
        }else if(req.files.consent_sign_image.length == 1){
            function consentSign(){
                if(typeof req.files.consent_sign_image[0].filename !== undefined){
                    return consent_sign_image = req.files.consent_sign_image[0].filename
                }
            }
            var consent_sign_image = consentSign();
        }else{
            console.log("No Consent sign image has been added")
        }



        
//
        if(req.files.document_image_1 == undefined){
//document_image_1
            function Image1(){
                return document_image_1 = null;
            }
            var document_image_1 = Image1();
        }else if(req.files.document_image_1.length == 1){
            function Image1(){
                if(typeof req.files.document_image_1[0].filename !== undefined){
                    return document_image_1 = req.files.document_image_1[0].filename
                }
            }
            var document_image_1 = Image1();
        }else{
            console.log("No Doc_Image1 has been added")
        }

        
//
        if(req.files.document_image_2 == undefined){
//document_image_2
            function Image2(){
                return document_image_2 = null;
            }
            var document_image_2 = Image2();
        }else if(req.files.document_image_2.length == 1){
            function Image2(){
                if(typeof req.files.document_image_2[0].filename !== undefined){
                    return document_image_2 = req.files.document_image_2[0].filename
                }
            }
            var document_image_2 = Image2();
        }else{
            console.log("No Doc_Image2 has been added")
        }

        
//
        if(req.files.document_image_3 == undefined){
//document_image_3
            function Image3(){
                return document_image_3 = null;
            }
            var document_image_3 = Image3();
        }else if(req.files.document_image_3.length == 1){
            function Image3(){
                if(typeof req.files.document_image_3[0].filename !== undefined){
                    return document_image_3 = req.files.document_image_3[0].filename
                }
            }
            var document_image_3 = Image3();
        }else{
            console.log("No Doc_Image3 has been added")
        }

        
//
        if(req.files.document_image_4 == undefined){
//document_image_4
            function Image4(){
                return document_image_4 = null;
            }
            var document_image_4 = Image4();
        }else if(req.files.document_image_4.length == 1){
            function Image4(){
                if(typeof req.files.document_image_4[0].filename !== undefined){
                    return document_image_4 = req.files.document_image_4[0].filename
                }
            }
            var document_image_4 = Image4();
        }else{
            console.log("No Doc_Image4 has been added")
        }

        
//
        if(req.files.document_image_5 == undefined){
//document_image_5
            function Image5(){
                return document_image_5 = null;
            }
            var document_image_5 = Image5();
        }else if(req.files.document_image_5.length == 1){
            function Image5(){
                if(typeof req.files.document_image_5[0].filename !== undefined){
                    return document_image_5 = req.files.document_image_5[0].filename
                }
            }
            var document_image_5 = Image5();
        }else{
            console.log("No Doc_Image5 has been added")
        }




        connection.query('INSERT INTO ticketdetails SET first_name = ?,middle_name = ?,last_name = ?,email = ?,mobile = ?,user_type = ?,court_date_type = ?,court_date = ?,court_name = ?,court_address = ?,icon_number = ?,offence_number = ?,offence_date = ?,offence_commitof = ?,contrary_to = ?,section = ?,vehicle_type = ?,fine_amount = ?,ticket_details = ?,ticket_back_side = ?,retainer_name = ?,location = ?,ticket_image_front = ?,ticket_image_back = ?,licence_image_front = ?,licence_image_back = ?,ticket_sign_image = ?,nia_sign_image = ?,consent_sign_image = ?,user_id = ?,posted_on = ?,ticket_status = ?,document_image_1 = ?,document_image_2 = ?,document_image_3 = ?,document_image_4 = ?,document_image_5 = ?',[first_name,middle_name,last_name,email,mobile,"guest",court_date_type,court_date,court_name,court_address,icon_number,offence_number,offence_date,offence_commitof,contrary_to,section,vehicle_type,fine_amount,ticket_details,ticket_back_side,retainer_name,location,ticket_image_front,ticket_image_back,licence_image_front,licence_image_back,ticket_sign_image,nia_sign_image,consent_sign_image,id,created,ticket_status,document_image_1,document_image_2,document_image_3,document_image_4,document_image_5],function(err,save){
        if(err){
            res.json({
                status: true,
                message: "Error Occured " + err
            })
        }else{

            var insertId = save.insertId;

            var ticket_gen_id = "VAG" + insertId ;

            connection.query('UPDATE ticketdetails SET ticket_gen_id = ? WHERE ticket_id = ?',[ticket_gen_id,insertId],function(err,gen){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{


            connection.query('INSERT INTO ticketlogs SET ticket_id = ?,court_date_type = ?,court_date = ?,ticket_status = ?,modified_by = ?',[insertId,court_date_type,court_date,ticket_status,"customer"],function(err,done){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                        res.json({
                            status: true,
                            ticketid: insertId,
                            message: "Your Ticket has been added successfully"
                        })
                }
            })




                }
            })

            

    

        }

        })

            }
        })



        connection.release();
    })

})



vagan.post('/getsection',function(req,res){

    var section = req.body.section;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }


    connection.query('SELECT * FROM ' + section,function(err,info){
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
    } )

        connection.release();
    })
})




//Court Icon


vagan.post('/courticon',function(req,res){
    
    var id = req.headers['id'];

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            });
        }



    connection.query('SELECT * FROM icon',function(err,icon){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            });
        }else{
            res.json({
                status: true,
                message: icon
            })
        }
    })






        connection.release();
    })

})






app.use('/vagan',vagan)

var apiRoutes = express.Router();


apiRoutes.post('/login',function(req,res){

    var mobile = req.body.mobile;
    var password = req.body.password;
    
    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in Conncting Database"
            });
        }



    connection.query('SELECT * FROM userdetails WHERE user_mobile=?',[mobile],function(err,mobile){
        if(err)throw err;

        if(mobile == 0){
            res.json({
                status: false,
                message: "Authentication failed.User not found"
            });
        }else if(mobile != 0){
            if(mobile[0].user_password != password){
                res.json({
                    status: false,
                    message: "Authentication failed.Wrong Password"
                });
            }else{

                var token = jwt.sign(mobile[0].user_mobile,app.get('superSecret'));

                var user_id = mobile[0].user_id;
                var user_mobile = mobile[0].user_mobile;
                var user_email = mobile[0].user_email;
                var apartment_no = mobile[0].apartment_no;
                var streetname = mobile[0].streetname;
                var city = mobile[0].city;
                var province = mobile[0].province;
                var postal_code = mobile[0].postal_code;
                var user_name = mobile[0].user_name;
                var user_image = mobile[0].user_image;
                

                res.json({
                    status: true,
                    id: user_id,
                    user_mobile: user_mobile,
                    user_email: user_email,
                    apartment_no: apartment_no,
                    streetname: streetname,
                    city: city,
                    province: province,
                    postal_code: postal_code,
                    user_name: user_name,
                    user_image: user_image,
                    token: token
                });

            }
        }
    })


        connection.release();
    })


});



apiRoutes.use(function(req,res,next){
var token = req.body.sessiontoken || req.query.sessiontoken || req.headers['sessiontoken'];

if(token){
    jwt.verify(token,app.get('superSecret'),function(err,decoded){
        if(err){
            return res.json({
                status: false,
                message: "Failed to authenticate token"
            });
        }else{
            req.decoded = decoded;
            next();
        }
    })
}else{
    return res.status(403).send({
        status: false,
        message: "No token provided"
    });
}

});


//Post

apiRoutes.post('/post',function(req,res){

    var id = req.headers['id'];
    
    var first_name = req.headers['first_name'];
    var middle_name = req.headers['middle_name'];
    var last_name = req.headers['last_name'];
    var email = req.headers['email'];
    var court_date_type = req.headers['court_date_type'];
    var court_date = req.headers['court_date'];
    var court_name = req.headers['court_name'];
    var court_address = req.headers['court_address'];
    var icon_number = req.headers['icon_number'];
    var offence_number = req.headers['offence_number'];
    var offence_date = req.headers['offence_date'];
    var offence_commitof = req.headers['offence_commitof'];
    var contrary_to = req.headers['contrary_to'];
    var section = req.headers['section'];
    var vehicle_type = req.headers['vehicle_type'];
    var fine_amount = req.headers['fine_amount'];
    var ticket_details = req.headers['ticket_details'];
    var ticket_back_side = req.headers['ticket_back_side'];
    var retainer_name = req.headers['retainer_name'];
    var location = req.headers['location'];
    

    var created = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss a');
    var ticket_status = "Ticket Received";

    pool.getConnection(function(err,connection){

        if(err) throw err ;



        ticksumupload(req,res,function(err){
            if(err){
                res.json({
                    status: false,
                    message: "Error Occured " + err
                });
            }else{


//
            if(req.files.ticket_image_front == undefined){
//ticket_image_front
                function ticketFront(){
                    return ticket_image_front = null;
                }
                var ticket_image_front = ticketFront();
            }else if(req.files.ticket_image_front.length == 1){
                function ticketFront(){
                    if(typeof req.files.ticket_image_front[0].filename !== undefined){
                        return ticket_image_front = req.files.ticket_image_front[0].filename
                    }
                }
                var ticket_image_front = ticketFront();
            }else{
                console.log("No Ticket Front image has been added");
            }



//
            if(req.files.ticket_image_back == undefined){
//ticket_image_back
            function ticketBack(){
                return ticket_image_back = null;
            }
                var ticket_image_back = ticketBack();
        }else if(req.files.ticket_image_back.length == 1){
            function ticketBack(){
                if(typeof req.files.ticket_image_back[0].filename !== undefined){
                    return ticket_image_back = req.files.ticket_image_back[0].filename
                }
            }
            var ticket_image_back = ticketBack();
        }else{
            console.log("No Ticket Back Image has been added");
        }


//
        if(req.files.licence_image_front == undefined){
//licence_image_front
            function licenceFront(){
                return licence_image_front = null;
            }
            var licence_image_front = licenceFront();
        }else if(req.files.licence_image_front.length == 1){
            function licenceFront(){
                if(typeof req.files.licence_image_front[0].filename !== undefined){
                    return licence_image_front = req.files.licence_image_front[0].filename
                }
            }
            var licence_image_front = licenceFront();
        }else{
            console.log("No Licence Front Image has been added");
        }



//
        if(req.files.licence_image_back == undefined){
//licence_image_back
            function licenceBack(){
                return licence_image_back = null;
            }
            var licence_image_back = licenceBack();
        }else if(req.files.licence_image_back.length == 1){
            function licenceBack(){
                if(typeof req.files.licence_image_back[0].filename !== undefined){
                    return licence_image_back = req.files.licence_image_back[0].filename
                }
            }
            var licence_image_back = licenceBack();
        }else{
            console.log("No Licence Back Image has been added");
        }


//
        if(req.files.ticket_sign_image == undefined){
//ticket_sign_image
            function ticketSign(){
                return ticket_sign_image = null;
            }
            var ticket_sign_image = ticketSign();
        }else if(req.files.ticket_sign_image.length == 1){
            function ticketSign(){
                if(typeof req.files.ticket_sign_image[0].filename !== undefined){
                    return ticket_sign_image = req.files.ticket_sign_image[0].filename
                }
            }
            var ticket_sign_image = ticketSign();
        }else{
            console.log("No Ticket Sign Image has been added");
        }




//
        if(req.files.nia_sign_image == undefined){
//nia_sign_image
            function niaSign(){
                return nia_sign_image = null;
            }
            var nia_sign_image = niaSign();
        }else if(req.files.nia_sign_image.length == 1){
            function niaSign(){
                if(typeof req.files.nia_sign_image[0].filename !== undefined){
                    return nia_sign_image = req.files.nia_sign_image[0].filename
                }
            }
            var nia_sign_image = niaSign();
        }else{
            console.log("No Nia Sign Image has been added")
        }

//
        if(req.files.consent_sign_image == undefined){
//consent_sign_image
            function consentSign(){
                return consent_sign_image = null;
            }
            var consent_sign_image = consentSign();
        }else if(req.files.consent_sign_image.length == 1){
            function consentSign(){
                if(typeof req.files.consent_sign_image[0].filename !== undefined){
                    return consent_sign_image = req.files.consent_sign_image[0].filename
                }
            }
            var consent_sign_image = consentSign();
        }else{
            console.log("No Consent sign image has been added")
        }



        
//
        if(req.files.document_image_1 == undefined){
//document_image_1
            function Image1(){
                return document_image_1 = null;
            }
            var document_image_1 = Image1();
        }else if(req.files.document_image_1.length == 1){
            function Image1(){
                if(typeof req.files.document_image_1[0].filename !== undefined){
                    return document_image_1 = req.files.document_image_1[0].filename
                }
            }
            var document_image_1 = Image1();
        }else{
            console.log("No Doc_Image1 has been added")
        }

        
//
        if(req.files.document_image_2 == undefined){
//document_image_2
            function Image2(){
                return document_image_2 = null;
            }
            var document_image_2 = Image2();
        }else if(req.files.document_image_2.length == 1){
            function Image2(){
                if(typeof req.files.document_image_2[0].filename !== undefined){
                    return document_image_2 = req.files.document_image_2[0].filename
                }
            }
            var document_image_2 = Image2();
        }else{
            console.log("No Doc_Image2 has been added")
        }

        
//
        if(req.files.document_image_3 == undefined){
//document_image_3
            function Image3(){
                return document_image_3 = null;
            }
            var document_image_3 = Image3();
        }else if(req.files.document_image_3.length == 1){
            function Image3(){
                if(typeof req.files.document_image_3[0].filename !== undefined){
                    return document_image_3 = req.files.document_image_3[0].filename
                }
            }
            var document_image_3 = Image3();
        }else{
            console.log("No Doc_Image3 has been added")
        }

        
//
        if(req.files.document_image_4 == undefined){
//document_image_4
            function Image4(){
                return document_image_4 = null;
            }
            var document_image_4 = Image4();
        }else if(req.files.document_image_4.length == 1){
            function Image4(){
                if(typeof req.files.document_image_4[0].filename !== undefined){
                    return document_image_4 = req.files.document_image_4[0].filename
                }
            }
            var document_image_4 = Image4();
        }else{
            console.log("No Doc_Image4 has been added")
        }

        
//
        if(req.files.document_image_5 == undefined){
//document_image_5
            function Image5(){
                return document_image_5 = null;
            }
            var document_image_5 = Image5();
        }else if(req.files.document_image_5.length == 1){
            function Image5(){
                if(typeof req.files.document_image_5[0].filename !== undefined){
                    return document_image_5 = req.files.document_image_5[0].filename
                }
            }
            var document_image_5 = Image5();
        }else{
            console.log("No Doc_Image5 has been added")
        }





        connection.query('INSERT INTO ticketdetails SET first_name = ?,middle_name = ?,last_name = ?,email = ?,user_type = ?,court_date_type = ?,court_date = ?,court_name = ?,court_address = ?,icon_number = ?,offence_number = ?,offence_date = ?,offence_commitof = ?,contrary_to = ?,section = ?,vehicle_type = ?,fine_amount = ?,ticket_details = ?,ticket_back_side = ?,retainer_name = ?,location = ?,ticket_image_front = ?,ticket_image_back = ?,licence_image_front = ?,licence_image_back = ?,ticket_sign_image = ?,nia_sign_image = ?,consent_sign_image = ?,user_id = ?,posted_on = ?,ticket_status = ?,document_image_1 = ?,document_image_2 = ?,document_image_3 = ?,document_image_4 = ?,document_image_5 = ?',[first_name,middle_name,last_name,email,"registered",court_date_type,court_date,court_name,court_address,icon_number,offence_number,offence_date,offence_commitof,contrary_to,section,vehicle_type,fine_amount,ticket_details,ticket_back_side,retainer_name,location,ticket_image_front,ticket_image_back,licence_image_front,licence_image_back,ticket_sign_image,nia_sign_image,consent_sign_image,id,created,ticket_status,document_image_1,document_image_2,document_image_3,document_image_4,document_image_5],function(err,save){
        if(err){
            res.json({
                status: true,
                message: "Error Occured " + err
            })
        }else{



            
             var insertId = save.insertId;

            var ticket_gen_id = "VAG" + insertId ;

            connection.query('UPDATE ticketdetails SET ticket_gen_id = ? WHERE ticket_id = ?',[ticket_gen_id,insertId],function(err,gen){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{


            connection.query('INSERT INTO ticketlogs SET ticket_id = ?,court_date_type = ?,court_date = ?,ticket_status = ?,modified_by = ?',[insertId,court_date_type,court_date,ticket_status,"customer"],function(err,done){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                        res.json({
                            status: true,
                            ticketid: insertId,
                            message: "Your Ticket has been added successfully"
                        })
                }
            })




                }
            })




        }

        })

            }
        })



        connection.release();
    })

})



//getsection

apiRoutes.post('/getsection',function(req,res){

    var section = req.body.section;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }


    connection.query('SELECT * FROM ' + section,function(err,info){
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
    } )

        connection.release();
    })
})

//my tickets


apiRoutes.post('/mytickets',function(req,res){

    var id = req.headers['id'];

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }


    connection.query('SELECT * FROM ticketdetails WHERE user_id = ? ORDER BY posted_on DESC',[id],function(err,posts){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else if(posts.length == 0){
            res.json({
                status: false,
                message: "No tickets has been posted yet"
            })
        }else{
            res.json({
                status: true,
                message: posts
            })
        }
    })


        connection.release();
    })
})





// my ticket -specfic

apiRoutes.post('/specificticket',function(req,res){

    var id = req.headers['id'];
    var ticket_id = req.body.ticket_id;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }


    connection.query('SELECT * FROM ticketdetails WHERE ticket_id = ?',[ticket_id],function(err,ticket){
        if(err){
            res.json({
                status: false,
                message: "Error in connecting Database"
            })
        }else{
            res.json({
                status: true,
                message: ticket
            })
        }
    })


        connection.release();
    })
})


//My Transaction

apiRoutes.post('/mytransactions',function(req,res){

    var id = req.headers['id'];

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }


    
    connection.query('SELECT * FROM ticketdetails WHERE payment_status = ? AND user_id = ? ORDER BY posted_on DESC',["approved",id],function(err,transactions){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: transactions
            })
        }
    })

    

    connection.release();
    })

})


//Spcific Transactions


apiRoutes.post('/specifictransaction',function(req,res){

    var id = req.headers['id'];
    
    var ticket_id = req.body.ticket_id;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }


    connection.query('SELECT * FROM transactions WHERE ticket_id = ?',[ticket_id],function(err,transaction){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: transaction
            })
        }
    })


        connection.release();
    })

})


//Update Feedback

apiRoutes.post('/updatefeedback',function(req,res){

    var id = req.headers['id'];
    var feedback = req.body.feedback;
    var rating = req.body.rating;
    var testimonial = req.body.testimonial;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }


    connection.query('UPDATE userdetails SET feedback = ?,rating = ?,testimonial = ? WHERE user_id = ?',[feedback,rating,testimonial,id],function(err,done){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: "Thanks for your feedback"
            })
        }
    })




        connection.release();
    })

})





//Payment



apiRoutes.post('/updatepayment',function(req,res){

    var user_id = req.headers['id'];

    var ticket_id = req.body.ticket_id;
    var transaction_id = req.body.transaction_id;
    var message = req.body.message;
    var amount = req.body.amount;
    var created = req.body.created;


    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }


    if(message == "approved"){



        connection.query('UPDATE ticketdetails SET payment_status = ?,transaction_id = ? WHERE ticket_id = ?',["approved",transaction_id,ticket_id],function(err,update){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

            var receipt_id = "VARC" + ticket_id ; 


            connection.query('INSERT INTO transactions SET transaction_id = ?,ticket_id = ?,amount = ?,message = ?,created = ?,receipt_id = ?',[transaction_id,ticket_id,amount,message,created,receipt_id],function(err,done){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                    res.json({
                        status: true,
                        message: "Your Payment is successfull"
                    })
                }
            })
        }
    })


    }else{
        
        connection.query('UPDATE ticketdetails SET payment_status = ? WHERE ticket_id = ?',["failed",ticket_id],function(err,fail){
            if(err){
                res.json({
                    status: false,
                    message: "Error Occured " + err
                })
            }else{
                res.json({
                    status: true,
                    message: "Your Payment is unsuccessfull"
                })
            }
        })



    }

    


        connection.release();
    })

})







//User update


apiRoutes.post('/userupdate',function(req,res){

    var user_id = req.headers['id'];

    var user_name = req.headers['user_name'];
    var user_mobile = req.headers['user_mobile'];
    var user_email = req.headers['user_email'];

    

    userUpload(req,res,function(err){
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

            connection.query('SELECT * FROM userdetails WHERE user_id = ?',[user_id],function(err,user){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{



                        
//
                                if(req.files == undefined ){
//userimage
                                function userImage(){
                                    return user_image = user[0].user_image ;   
                            }
                                var user_image = userImage()
                                }else if(req.files.length == 1){
                                    function userImage(){
                                     if(typeof req.files[0].filename !== undefined){
                                    return user_image = req.files[0].filename
                                }else{
                                    return user_image = user[0].user_image ;
                                }
                                }
                                var user_image = userImage()
                                    console.log("No user image has been attached");
                                }




                connection.query('UPDATE userdetails SET user_name = ?,user_mobile = ?,user_email = ?,user_image = ? WHERE user_id = ?',[user_name,user_mobile,user_email,user_image,user_id],function(err,done){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                    res.json({
                        status: true,
                        message: "Your Profile details has been Updated Successfully"
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

















app.use('/vagan/api',apiRoutes);



}