const express = require('express')
const studentCntl = require('../controllers/StudentController')
const uploadImage = require('../middleware/uploadImage')

const router = express.Router()

router.post('/add-student', uploadImage.single('profile_image') ,studentCntl.createStudent)
router.get('/get-students',studentCntl.getAllStudent)
router.get('/get-student/:id',studentCntl.getStudentbyId)
router.put('/update-student/:id', uploadImage.single('profile_image'), studentCntl.updateStudent)
router.delete('/delete-student/:id', studentCntl.deleteStudent)

module.exports = router