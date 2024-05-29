const mongoose = require('mongoose')

const schoolSchema = new mongoose.Schema({
    school_name: {
        type: String,
        required: true,
        unique: true
    },
    school_address: {
        type: String,
        required: true
    },
    school_logo: {
        type: String,
        required: true
    }
}, { timestamps: true })

const School = mongoose.model('School', schoolSchema)

module.exports = School