const express = require('express')
const customerCntrl = require('../controllers/CustomerController')
const uploadImage = require('../middleware/uploadImage');

const router = express.Router()

router.post('/add-customers',uploadImage.none(),customerCntrl.addCustomer)
router.get('/get-customers',customerCntrl.getCustomers)
router.get('/get-customer/:id',customerCntrl.getCustomerbyId)
router.put('/update-customers/:id', uploadImage.none(), customerCntrl.updateCustomer)
router.delete('/delete-customer/:id', customerCntrl.deleteCustomer)

module.exports = router