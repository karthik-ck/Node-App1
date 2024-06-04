const express = require('express')
const attendanceCntrl = require('../controllers/AttendanceController')

const router = express.Router()

router.post('/update-attendance', attendanceCntrl.markAttendance)
router.get('/get-report',attendanceCntrl.getAttandanceDetails)
router.get('/get-list',attendanceCntrl.getStudentAttendance)

module.exports = router