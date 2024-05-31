const mongoose = require('mongoose')

const subjectSchema = new mongoose.Schema({
    subject_name: {
        type: String,
        required: true,
        unique: true
    },
    subject_code: {
        type: String,
        required: true,
        unique: true
    },
    subject_type: {
        type: String,
        required: true,
    }
}, { timestamps: true })

const Subject = mongoose.model('Subject', subjectSchema)
module.exports = Subject