const mongoose = require('mongoose')

const classSchema = new mongoose.Schema({
    class_name: {
        type: String,
        required: true,
        unique: true
    },
    section: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    }],
    branch:[{
        type:mongoose.Schema.Types.ObjectId,
        res:'Branch'
    }]
}, { timestamps: true })

const Class = mongoose.model('Class', classSchema)

module.exports = Class