const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
    customer_name : {
        type:String,
        required:true
    },
    phone_number:{
        type:Number,
        required:true,
        unique:true
    },
    email_id:{
        type: String,
        required: true,
        unique: true
    },
    address:{
        type: String,
        required: true
    }
},{timestamps:true})

const Customer = mongoose.model('Customer', customerSchema)
module.exports = Customer