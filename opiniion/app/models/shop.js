let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Count = require('./shopcount')

let Rotators = new Schema({
    name: {type: String},
    url: {type: String},
    positiveurl: {type: String}
})

let Customers = new Schema({
    firstname: {type: String},
    lastname: {type: String},
    email: {type: String},
    countrycode: {type: String},
    phone: {type: String},
    notes: {type: String},
    rating: {type: String,default:"null"},
    feedback: {type: String,default:"null"},
    createdAt: {type: String},
    engagedAt: {type: String},
    mandrillId: {type: String}
})

let shopSchema = new Schema({
    userid: {type: String},
    shopid: {type: String},
    api: {type: String},
    companyname: {type: String},
    address: {type: String},
    city: {type: String},
    state: {type: String},
    email: {type: String},
    zipcode: {type: String},
    countrycode: {type: String},
    phone: {type: String},
    branch: {type: String},
    buttoncolor: {type: String},
    footercolor: {type: String},
    landingpage: {type: String},
    customers: [Customers],
    fromname: {type: String},
    mailactive: {type: String,default: "true"},
    messageactive: {type: String,default: "true"},
    mailtemplate1: {type: String},
    mailtemplate1subject: {type: String},
    mailtemplate2: {type: String},
    mailtemplate3: {type: String},
    mailtemplate4: {type: String},
    msgtemplate1: {type: String},
    msgtemplate2: {type: String},
    msgtemplate3: {type: String},
    msgtemplate4: {type: String},
    landline1: {type: String},
    landline2: {type: String},
    landline3: {type: String},
    reviewline1: {type: String},
    reviewline2: {type: String},
    reviewline3: {type: String},
    rotators: [Rotators],
    rotatorindex: {type: Number,default: 0},
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