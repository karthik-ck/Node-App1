const mongoose = require('mongoose')

const ObjectId = mongoose.Schema.ObjectId
const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    profile_image: {
        type: String,
        required: true
    },
    school_id: {
        type: ObjectId,
        required: true
    }
}, { timestamps: true })

const Student = mongoose.model('Student', StudentSchema)

module.exports = Student