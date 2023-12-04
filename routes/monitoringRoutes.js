const express = require('express')
const router = express.Router()

const {singlePost , singleGet} = require('../controllers/monitoringController')

router.post('/spost',singlePost)
router.get('/sget/:deviceId',singleGet)

module.exports = router