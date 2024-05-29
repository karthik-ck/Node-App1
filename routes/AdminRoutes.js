const express = require('express')
const adminCntrl = require('../controllers/AdminController')

const router = express.Router()

router.post('/add-admin',adminCntrl.createAdmin)
router.get('/get-admin',adminCntrl.getAllAdmin)
router.get('/get-admin/:id',adminCntrl.getAdminbyId)
router.put('/update-admin/:id',adminCntrl.updateAdmin)
router.delete('/delete-admin/:id',adminCntrl.deleteAdmin)

module.exports = router