const express = require('express')
const router = express.Router()
const loginCntrl = require('../controllers/LoginController')
const uploadImage = require('../middleware/uploadImage');

router.post('/register', uploadImage.none() ,loginCntrl.register)
router.post('/login', uploadImage.none() ,loginCntrl.login)
router.get('/get-register-user',loginCntrl.registerdUser)

module.exports = router