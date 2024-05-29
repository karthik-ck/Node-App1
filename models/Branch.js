const mongoose = require('mongoose')

const branchSchema = new mongoose.Schema({
    branch_name: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true })

const Branch = mongoose.model('Branch', branchSchema)

module.exports = Branch