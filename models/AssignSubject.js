const mongoose = require('mongoose')

const objectId = mongoose.Schema.ObjectId
const assignSchema = new mongoose.Schema({
    studentId:{
        type: objectId
    },
    subjectId:[{
        type: objectId,
        ref:'Subject'
    }]
})

const subjectSchema = new mongoose.Schema({
    studentSubjects:{
        type: [assignSchema]
    }
})

const AssignSubject = mongoose.model('AssignSubject', subjectSchema)

module.exports = AssignSubject