var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var moment = require('moment');
var multer = require('multer');
var mime = require('mime');

var pool = require('../connection');


//Licence Image

var licencestorage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"C:/wamp64/www/medikally/assets/img/medical_licence");
    },
    filename: function(req,file,cb){
        var datetimestamp = Date.now();
        cb(null,file.fieldname + '-' + datetimestamp + mime.extension(file.mimetype));
    }
})

var licenceupload = multer({
    storage: licencestorage
}).array('licence',1);





//user Update

var userupdatestorage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'C:/wamp64/www/medikally/assets/img/user_image');
    },
    filename : function(req,file,cb){
        var datetimestamp = Date.now();
        var userid = req.headers['id'];
        cb(null,userid + '-' +file.fieldname + '-' + datetimestamp + '.' + mime.extension(file.mimetype));
    }
});

var userupdateupload = multer({
    storage : userupdatestorage
}).array('userimage', 1);






module.exports = function(app){


var medikally = express.Router();
















//Getting the user Image

medikally.get('/user_image/:name',function(req,res,next){
    var options = {
        root: 'C:/wamp64/www/medikally/assets/img/user_image'
    };

    var filename = req.params.name;
    res.sendFile(filename,options,function(err){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            console.log(filename + "has been sent");
        }
    })
})







//Getting the Drug Image

medikally.get('/drug_image/:name',function(req,res,next){
    var options = {
        root: 'C:/wamp64/www/medikally/assets/img/drug_image'
    };

    var filename = req.params.name;
    res.sendFile(filename,options,function(err){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            console.log(filename + "has been sent");
        }
    })
})



//Medikally signup


medikally.post('/signup',function(req,res){

    var created = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss');

    var mobile = req.headers['mobileno'];
    var password = req.headers['password'];
    var username = req.headers['username'];
    var email = req.headers['email'];
    var licence_number = req.headers['licence_number'];
    var address = req.headers['address'];
    

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            });
        }


   connection.query('SELECT * FROM users WHERE user_mobile = ?',[mobile],function(err,mobilever){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else if(mobilever.length == 1){
            res.json({
                status: false,
                message: "Mobile Number exists already"
            })
        }else if(mobilever.length != 1){
            
            connection.query('SELECT * FROM users WHERE user_email = ?',[email],function(err,emailver){
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
                   

                                       
 licenceupload(req,res,function(err){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            });
        }else{


                             
//
                                if(req.files == undefined){
//licenceimage
                                    function licenceImage(){
                                        return licenceimage = "null" ;
                                    }
                                    var licenceimage = licenceImage()
                                }else if(req.files.length == 1){
                                function licenceImage(){
                                     if(typeof req.files[0].filename !== undefined){
                                    return licence = req.files[0].filename
                                }
                                }
                                var licenceimage = licenceImage()
                                }else{
                                    console.log("No Licence Image has been attached");
                                }





            var signup = {user_name: username,user_mobile: mobile,user_password: password,user_email: email,created_date: created,licence_number: licence_number,licence_img: licenceimage,verification_status: "false",user_address: address}


            connection.query('INSERT INTO users SET?',signup,function(err,user){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            });
        }else{
            res.json({
                status: true,
                message: "You have been successfully registered with Medikally"
            });
        }
    });


        }
    })

                }
            })


        }


   })

        connection.release();
    })

})




app.use('/medikally',medikally);



var apiRoutes = express.Router();


apiRoutes.post('/login',function(req,res){

    var mobile = req.body.mobileno;
    var password = req.body.password;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            });
        }
    
    

    connection.query('SELECT * FROM users WHERE user_mobile = ?',[mobile],function(err,mobile){
        if(err) throw err;

        if(mobile == 0){
            res.json({
                status: false,
                message: "Authentication failed.User not found"
            });
        }else if(mobile != 0){
            if(mobile[0].user_password != password){
                res.json({
                    status: false,
                    message: "Authenntication failed.Wrong Password" 
                });
            }else{

                var token = jwt.sign(mobile[0].user_mobile,app.get('superSecret'));

                var user_id = mobile[0].user_id;
                var user_mobile = mobile[0].user_mobile;
                var user_email = mobile[0].user_email;
                var user_name = mobile[0].user_name;
                var licence_img = mobile[0].licence_img;
                var licence_number = mobile[0].licence_number;
                var user_image = mobile[0].user_image;

                res.json({
                    status: true,
                    id: user_id,
                    user_name: user_name,
                    user_mobile: user_mobile,
                    user_email: user_email,
                    licence_image: licence_img,
                    licence_number: licence_number,
                    user_image: user_image,
                    token: token
                });

            }
        }



    })



    connection.release();
    })

})



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




//Update Licence


apiRoutes.post('/updatelicence',function(req,res){

    var id = req.headers['id'];
    var licence_number = req.headers['licence_number'];

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            });
        }

    

    licenceupload(req,res,function(err){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{


            connection.query('SELECT * FROM users WHERE user_id = ?',[id],function(err,user){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{


                    var verification_status = user[0].verification_status;


//
                                if(req.files == undefined){
//licenceimage
                                    function licenceImage(){
                                        return licenceimage = user[0].licence_image ;
                                    }
                                    var licenceimage = licenceImage()
                                }else if(req.files.length == 1){
                                function licenceImage(){
                                     if(typeof req.files[0].filename !== undefined){
                                    return licence = req.files[0].filename
                                }
                                }
                                var licenceimage = licenceImage()
                                }else{
                                    console.log("No Licence Image has been attached");
                                }



                
            connection.query('UPDATE users SET licence_number = ?,licence_img = ?',[licence_number,licenceimage],function(err,save){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                    res.json({
                        status: true,
                        licence_number: licence_number,
                        licence_image: licenceimage,
                        verification_status: verification_status
                    });
                }
            })


                }
            })


        }


    })



    connection.release();

    })

})



//Drug type

apiRoutes.post('/drugtype',function(req,res){

    var id = req.headers['id'];

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in Connecting Database"
            })
        }


    connection.query('SELECT * FROM drugs',function(err,drug){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            });
        }else{

            connection.query('SELECT user_coupons FROM users WHERE user_id = ?',[id],function(err,user){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{


                    var user_coupons = user[0].user_coupons ;

                                    
                            res.json({
                                status: true,
                                message: drug,
                                user_coupons: user_coupons
                            })



                }
            })


        }

    })

    connection.release();
    })


})



//Licence Status Check

apiRoutes.post('/licenceverify',function(req,res){

        var id = req.headers['id'];

        pool.getConnection(function(err,connection){
            if(err){
                res.json({
                    status: false,
                    code: 100,
                    message: "Error in connecting Database"
                })
            }


        connection.query('SELECT licence_img,licence_number,verification_status FROM users WHERE user_id = ?',[id],function(err,verify){
            if(err){
                res.json({
                    status: false,
                    message: "Error in connecting Database"
                })
            }else{
                res.json({
                    status: true,
                    message: verify
                })
            }
        })



            connection.release();
        })
})




//place order


apiRoutes.post('/placeorder',function(req,res){
    
    var rep_id = req.headers['id'];

    var created = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm:ss');

    var obj = req.body
    var key = Object.keys(obj);
  

    var Drug = [];
    var Total = [];
    
    var order_id1 = [];


    var drug = obj[key[0]];
    var total = obj[key[1]];


    function all(){

        function dru(){
            for(var i=0;i<drug.length;i++){
                Drug.push([order_id1,drug[i].name,drug[i].strips,drug[i].price]);
            }
        }

        dru();


        function tot(){               
                Total.push(total.price)              
        }

        tot();

    }

 
    all();



    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            });
        }


    connection.query('INSERT INTO orders SET rep_id = ?,order_date = ?,total_amt = ?,order_status = ?',[rep_id,created,Total[0],"Order Placed"],function(err,order){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

           var order_id = order.insertId;
           order_id1.push(order_id);

            connection.query('INSERT INTO order_details (order_id,drug_name,strips_count,amt) VALUES ?',[Drug],function(err,details){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                    res.json({
                        status: true,
                        order_id: order_id,
                        total: Total[0],
                        message: "Your post has been added successfully"
                    })
                }
            })



        }
    })



        connection.release();
    })

})



// //My Orders


// apiRoutes.post('/myorder',function(req,res){


//         var id = req.headers['id'];


//     pool.getConnection(function(err,connection){
//         if(err){
//             res.json({
//                 status: false,
//                 code: 100,
//                 message: "Error in connecting Database"
//             })
//         }


//     connection.query('SELECT orders.rep_id,orders.order_id,orders.order_date,orders.total_amt,order_details.order_details_id,order_details.drug_name,order_details.box_quantity,order_details.amt FROM orders INNER JOIN order_details ON orders.order_id = order_details.order_id WHERE orders.rep_id = ? ORDER BY orders.order_id DESC',[id],function(err,order){
//         if(err) throw err;

//         if(order == 0){
//             res.json({
//                 status: true,
//                 message: "No Order History listed yet"
//             })
//         }else if(order != 0){
//             res.json({
//                 status: true,
//                 message: order
//             })
//         }

//     })



//         connection.release();
//     })


// })


//My orders - NEW

apiRoutes.post('/myorder',function(req,res){


        var id = req.headers['id'];


    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }


    connection.query('SELECT orders.rep_id,orders.order_id,orders.order_date,orders.total_amt,orders.order_status,COUNT(order_details.order_details_id) AS count FROM orders INNER JOIN order_details ON orders.order_id = order_details.order_id WHERE orders.rep_id = ? GROUP BY orders.order_id ORDER BY orders.order_id DESC',[id],function(err,order){
        if(err) throw err;

        if(order == 0){
            res.json({
                status: true,
                message: "No Order History listed yet"
            })
        }else if(order != 0){
            res.json({
                status: true,
                message: order
            })
        }

    })



        connection.release();
    })


})



// Orders in Brief

apiRoutes.post('/getorder',function(req,res){

    var order_id = req.body.order_id;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }


    connection.query('SELECT * FROM order_details WHERE order_id = ?',[order_id],function(err,order){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: order
            })
        }
    })


        connection.release();
    })
})





//Delete Order


apiRoutes.post('/deleteorder',function(req,res){

    var id = req.headers['id'];

    var order_id = req.body.order_id;

    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in connecting Database"
            })
        }



    connection.query('DELETE orders,order_details FROM orders INNER JOIN order_details ON orders.order_id = order_details.order_id AND order_details.order_id = ?',[order_id],function(err,done){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: "Your order has been removed successfully"
            })
        }
    })


        connection.release();
    })

})


//View Profile

apiRoutes.post('/viewprofile',function(req,res){

    var id = req.headers['id'];


    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error Occured " + err
            })
        }


    connection.query('SELECT * FROM users WHERE user_id = ?',[id],function(err,user){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{
            res.json({
                status: true,
                message: user
            })
        }
    })


        connection.release();
    })

})


//Profile Update

apiRoutes.post('/profileupdate',function(req,res){

    var id = req.headers['id'];

    var username = req.headers['user_name'];
    var usermobile = req.headers['user_mobile'];
    var useremail = req.headers['user_email'];
    var useraddress = req.headers['user_address'];



    pool.getConnection(function(err,connection){
        if(err){
            res.json({
                status: false,
                code: 100,
                message: "Error in Connecting Database"
            })
        }


    userupdateupload(req,res,function(err){
        if(err){
            res.json({
                status: false,
                message: "Error Occured " + err
            })
        }else{

        
            connection.query('SELECT * FROM users WHERE user_id = ?',[id],function(err,user){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{



//
                                if(req.files == undefined){
//userimage
                                    function userImage(){
                                        return userimage = user[0].user_image ;
                                    }
                                    var userimage = userImage()
                                }else if(req.files.length == 1){
                                function userImage(){
                                     if(typeof req.files[0].filename !== undefined){
                                    return user = req.files[0].filename
                                }
                                }
                                var userimage = userImage()
                                }else{
                                    console.log("No user Image has been attached");
                                }


            connection.query('UPDATE users SET user_name = ?,user_mobile,user_email,user_address=?,user_image = ? WHERE user_id = ?',[username,usermobile,useremail,useraddress,userimage,id],function(err,save){
                if(err){
                    res.json({
                        status: false,
                        message: "Error Occured " + err
                    })
                }else{
                    res.json({
                        status: true,
                        message: "Your profile has been updated successfully",
                        username: username,
                        usermobile: usermobile,
                        useremail: useremail,
                        useraddress: useraddress,
                        userimage: userimage
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





















app.use('/medikally/api',apiRoutes);


}