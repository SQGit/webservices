let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Count = require('./usercount');

let userSchema = new Schema({
    firstname: {type: String},
    middlename: {type: String,default: "null"},
    lastname: {type: String},
    email: {type: String},
    countrycode: {type: String,default: "null"},
    phone: {type: String},
    password: {type: String},
    category: {type: String},
    userid: {type: String},
    shopid: {type: String, default: "null"},
    shoprefid: {type: String,default: "null"},
    userrefid: {type: String},
    userimage: {type: Array},
    createdAt: {type: String},
    updatedAt: {type: String},
    createdBy: {type: String},
    updatedBy: {type: String},
    access: {type: String, default: "granted"},
    modify: {type: String},
    changepass: {type: String,default:"true"}
});


userSchema.pre('validate',function(next){

    var self = this;

   

    mongoose.models['user'].findOne({email: self.email},(err,results) => {
        if(err){
            next(err)
        }else if(results){
            self.invalidate("email","email must be unique");
            next(new Error("Email must be unique"));
        }else{
           next();
        }
    })

})



// userSchema.pre('findOneAndUpdate',function(next){

//     var self = this;

//     // let email = self._update.$set.email

//      var doc = this.getUpdate();

    
//      let email = doc.$set.email ;

//     mongoose.models['user'].findOne({email: email},(err,results) => {
//         if(err){
//             next(err)
//         }else if(results){
//             console.log(results)
//             next();
//         }else{
//             next();
//         }
//     })

// })





userSchema.pre('save', function(next){
    let doc = this;
    let category = this.category;

Count.findOneAndUpdate({"name":"user"},{$setOnInsert:{count:1000}},{safe:true,upsert:true,new:true,setDefaultsOnInsert:true},(err,counter) => {
        if(err) return next(err);
        else{

            
    if(category == "clientadmin"){

    Count.findOneAndUpdate({"name":"user"},{$inc: {count: 1}},{safe:true,upsert:true,new:true},(err,counter) => {
        if(err) return next(err);
        doc.userid = "CL" + counter.count;
        next();
    })

}else if(category == "clientuser"){

    Count.findOneAndUpdate({"name":"user"},{$inc: {count: 1}},{safe:true,upsert:true,new:true},(err,counter) => {
        if(err) return next(err);
        doc.userid = "CU" + counter.count;
        next();
    })


}else{
    
    Count.findOneAndUpdate({"name":"user"},{$inc: {count: 1}},{safe:true,upsert:true,new:true},(err,counter) => {
        if(err) return next(err);
        doc.userid = "SU" + counter.count;
        next();
    })

}


}

    })

})




module.exports = mongoose.model('user',userSchema);