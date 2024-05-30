const express = require('express')
const classCntrl = require('../controllers/ClassController')
const uploadImage = require('../middleware/uploadImage');

const router = express.Router()

router.post('/add-class', uploadImage.none(), classCntrl.addClass)
router.get('/get-class',classCntrl.getAllClass)
router.get('/get-class/:id',classCntrl.getClassbyId)
router.put('/update-class/:id', uploadImage.none() ,classCntrl.updateClass)
router.delete('/delete-class/:id',classCntrl.deleteClass)

module.exports = router