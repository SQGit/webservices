let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Sold = new Schema({
    username: String,
    email: String,
    phone: String,
    dateofbirth: String,
    rating: String,
    posted: String
})

let Enquiry = new Schema({
    username: String,
    email: String,
    phone: String,
    dateofbirth: String,
    comments: String,
    posted: String
})

let shopSchema = new Schema({
    shopname: String,
    password: String,
    sold: [Sold],
    enquiry: [Enquiry]
})


module.exports = mongoose.model('shop',shopSchema);