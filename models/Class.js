const mongoose = require('mongoose')

const ObjectId = mongoose.Schema.ObjectId
const classSchema = new mongoose.Schema({
    class_name: {
        type: String,
        required: true,
        unique: true
    },
    section: [{
        type: ObjectId,
        ref: 'Section',
        required: true
    }],
    branch:[{
        type: ObjectId,
        res:'Branch'
    }],
    subject:[{
        type:ObjectId,
        ref:'Subject',
        required: true
    }]
}, { timestamps: true })

const Class = mongoose.model('Class', classSchema)

module.exports = Class