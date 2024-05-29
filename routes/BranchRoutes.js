const express = require('express')
const branchCntrl = require('../controllers/BranchController')
const uploadImage = require('../middleware/uploadImage');

const router = express.Router()

router.post('/add-branch', uploadImage.none() ,branchCntrl.addBranch)
router.get('/get-branch',branchCntrl.getBranch)

module.exports = router