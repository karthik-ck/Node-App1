const express = require('express')
const assignCntrl = require('../controllers/AssignSubjectController')

const router=express.Router()

router.post('/assign',assignCntrl.assign)
router.get('/list',assignCntrl.listStudents)

module.exports = router