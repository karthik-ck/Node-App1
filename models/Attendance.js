const mongoose = require('mongoose')

const objectId = mongoose.Schema.ObjectId
const attendanceDataSchema = new mongoose.Schema({
    attendance: {
        type: String
    },
    student_id: {
        type: objectId
    }
})

const attendanceSchema = new mongoose.Schema({
    attendance_year: {
        type: String
    },
    attendance_month: {
        type: String
    },
    attendance_date: {
        type: String
    },
    attendanceData: {
        type: [attendanceDataSchema]
    }
})

const Attendance = mongoose.model("Attendance", attendanceSchema)
module.exports = Attendance