const express = require('express')
const subjectCntrl = require('../controllers/SubjectController')
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router()

router.post('/add-subject', upload.single('file') ,subjectCntrl.addSubject)
router.get('/get-subject',subjectCntrl.getSubjects)
router.get('/download-subject',subjectCntrl.downloadSubject)

module.exports = router