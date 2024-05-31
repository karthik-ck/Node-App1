const express = require('express')
const partyCntrl = require('../controllers/PartyController')
const uploadImage = require('../middleware/uploadImage');

const router = express.Router()

router.post('/add-party', uploadImage.none(), partyCntrl.addParty)
router.get('/get-party', partyCntrl.getParty)
router.get('/get-party/:id', partyCntrl.getPartybyId)
router.put('/update-party/:id', uploadImage.none(), partyCntrl.updateParty)
router.delete('/delete-party/:id', partyCntrl.deleteParty)

module.exports = router