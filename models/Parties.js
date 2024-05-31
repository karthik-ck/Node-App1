const mongoose = require('mongoose')

const partySchema = new mongoose.Schema({
    party_name: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true,
        unique: true
    },
    email_id: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    }
}, { timestamps: true })

const partiesSchema = new mongoose.Schema({
    parties: {
        type: [partySchema],
        required: true
    },
    amount:{
        type:Number,
        required:true
    }
})

const Party = mongoose.model('Party', partiesSchema)
module.exports = Party