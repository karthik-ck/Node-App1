const express = require('express');
const userCntrl = require('../controllers/UserController')

const router = express.Router();

router.post('/add-users', userCntrl.createUser);
router.get('/list-users', userCntrl.getAllUsers);
router.get('/get-user/:id', userCntrl.getUserbyId)
router.delete('/delete-user/:id', userCntrl.deleteUserbyId)
router.put('/update-user/:id',userCntrl.updateUser)
router.get('/get-usercount',userCntrl.getUserCount)

module.exports = router;