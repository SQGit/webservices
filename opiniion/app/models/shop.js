let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Count = require('./shopcount')

let Customers = new Schema({
    firstname: {type: String},
    lastname: {type: String},
    email: {type: String},
    phone: {type: String},
    notes: {type: String}
})

let shopSchema = new Schema({
    userid: {type: String},
    shopid: {type: String},
    companyname: {type: String},
    address: {type: String},
    city: {type: String},
    state: {type: String},
    zipcode: {type: String},
    phone: {type: String},
    buttoncolor: {type: String},
    footercolor: {type: String},
    landingpage: {type: String},
    customers: [Customers],
    logo: {type: Array}
})


shopSchema.pre('save',function(next){

    let doc = this;

    Count.findOneAndUpdate({"name":"shop"},{$setOnInsert:{count:1000}},{safe:true,upsert:true,new:true,setDefaultsOnInsert:true},(err,counter) => {
        if(err) return next(err);
        else{

    Count.findOneAndUpdate({"name":"shop"},{$inc: {count: 1}},{safe:true,upsert:true,new:true},(err,counter) => {
        if(err) return next(err);
        doc.shopid = "BS" + counter.count;
        next();
    })


        }
    })

    
 


})


module.exports = mongoose.model('shop',shopSchema);