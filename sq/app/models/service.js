let mongoose = require('mongoose');
let Schema = mongoose.Schema ;


let Count = require('./servicecount')


let serviceSchema = new Schema({
    username: String,
    serviceid: String,
    email: String,
    phone: String,
    device: String,
    imei: String,
    serial: String,
    status: {type: String,default: "processing"},
    model: String,
    description: String,
    staffname: String,
    created: String
})




serviceSchema.pre('save',function(next){

    let doc = this;

    Count.findOneAndUpdate({"name":"service"},{$setOnInsert:{count:1000}},{safe:true,upsert:true,new:true,setDefaultsOnInsert:true},(err,counter) => {
        if(err) return next(err);
        else{

    Count.findOneAndUpdate({"name":"service"},{$inc: {count: 1}},{safe:true,upsert:true,new:true},(err,counter) => {
        if(err) return next(err);
        doc.serviceid = "SQSER" + counter.count;
        next();
    })


        }
    })

    
 


})

module.exports = mongoose.model('service',serviceSchema);