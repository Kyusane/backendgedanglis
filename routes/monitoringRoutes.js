const express = require('express')
const router = express.Router()

const {singlePost , singleGet, graphGet} = require('../controllers/monitoringController')

router.post('/spost',singlePost)
router.get('/sget/:deviceId',singleGet)
router.get('/graph/:deviceId/:date',graphGet)

module.exports = router