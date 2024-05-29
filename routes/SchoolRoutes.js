const express = require('express')
const schoolCntrl = require('../controllers/SchoolController')
const uploadImage = require('../middleware/uploadImage');

const router = express.Router()

router.post('/add-school', uploadImage.single('school_logo') ,schoolCntrl.createSchool)
router.get('/get-school',schoolCntrl.getAllSchool)
router.get('/get-school/:id',schoolCntrl.getSchoolbyId)
router.put('/update-school/:id', uploadImage.single('school_logo') ,schoolCntrl.updateSchool)

module.exports = router