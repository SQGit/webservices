let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Count = require('./usercount');

let userSchema = new Schema({
    firstname: {type: String},
    lastname: {type: String},
    email: {type: String},
    phone: {type: String},
    password: {type: String},
    category: {type: String},
    userid: {type: String}
});


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
        doc.userid = this.category + counter.count;
        next();
    })

}


}

    })


})




module.exports = mongoose.model('user',userSchema);