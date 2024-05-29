const express = require('express')
const sectionCntrl = require('../controllers/SectionController')
const uploadImage = require('../middleware/uploadImage');

const router = express.Router()

router.post('/add-section', uploadImage.none(),sectionCntrl.addSection)
router.get('/get-section',sectionCntrl.getSection)

module.exports = router