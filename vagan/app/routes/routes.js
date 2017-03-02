var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var moment = require('moment');
var multer = require('multer');
var mime = require('mime');

var pool = require('../connection');


//Ticksum Image

var ticksumstorage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, "./public/uploads");
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
    name: "ticket_sign_image", maxCount: 1
}])



module.exports = function(app){



var vagan = express.Router();



// Vagan Signup

vagan.post('/signup',function(req,res){

    var created = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss');

    var mobile = req.body.mobile;
    var password = req.body.password;
    var email = req.body.email;

    var signup = {user_mobile: mobile,user_password: password,user_email: email};

    
    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            });
        }

    
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


        connection.release();
    })

})


//Post without signup

vagan.post('/post',function(req,res){

    var id = req.headers['id'];
    
    var name = req.headers['name'];
    var email = req.headers['email'];
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
                    return ticket_image_front = "null";
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
                return ticket_image_back = "null";
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
                return licence_image_front = "null";
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
                return licence_image_back = "null";
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
                return ticket_sign_image = "null";
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

        connection.query('INSERT INTO postdetails SET name = ?,email = ?,user = ?,court_date = ?,court_name = ?,court_address = ?,icon_number = ?,offence_number = ?,offence_date = ?,offence_commitof = ?,contrary_to = ?,section = ?,vehicle_type = ?,fine_amount = ?,ticket_details = ?,ticket_back_side = ?,retainer_name = ?,location = ?,ticket_image_front = ?,ticket_image_back = ?,licence_image_front = ?,licence_image_back = ?,ticket_sign_image = ?,user_id = ?',[name,email,"guest",court_date,court_name,court_address,icon_number,offence_number,offence_date,offence_commitof,contrary_to,section,vehicle_type,fine_amount,ticket_details,ticket_back_side,retainer_name,location,ticket_image_front,ticket_image_back,licence_image_front,licence_image_back,ticket_sign_image,id],function(err,save){
        if(err){
            res.json({
                status: true,
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
                

                res.json({
                    status: true,
                    id: user_id,
                    user_mobile: user_mobile,
                    user_email: user_email,
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
    
    var name = req.headers['name'];
    var email = req.headers['email'];
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
                    return ticket_image_front = "null";
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
                return ticket_image_back = "null";
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
                return licence_image_front = "null";
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
                return licence_image_back = "null";
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
                return ticket_sign_image = "null";
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


        connection.query('INSERT INTO postdetails SET name = ?,email = ?,user = ?,court_date = ?,court_name = ?,court_address = ?,icon_number = ?,offence_number = ?,offence_date = ?,offence_commitof = ?,contrary_to = ?,section = ?,vehicle_type = ?,fine_amount = ?,ticket_details = ?,ticket_back_side = ?,retainer_name = ?,location = ?,ticket_image_front = ?,ticket_image_back = ?,licence_image_front = ?,licence_image_back = ?,ticket_sign_image = ?,user_id = ?',[name,email,"registered",court_date,court_name,court_address,icon_number,offence_number,offence_date,offence_commitof,contrary_to,section,vehicle_type,fine_amount,ticket_details,ticket_back_side,retainer_name,location,ticket_image_front,ticket_image_back,licence_image_front,licence_image_back,ticket_sign_image,id],function(err,save){
        if(err){
            res.json({
                status: true,
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



        connection.release();
    })

})















app.use('/vagan/api',apiRoutes);



}