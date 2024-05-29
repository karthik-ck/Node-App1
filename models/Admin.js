const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
}, { timestamps: true }
)

const Admin = mongoose.model('Admin', adminSchema)

module.exports = Admin