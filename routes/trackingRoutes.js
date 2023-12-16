const express = require('express')
const router = express.Router()

const {singlePost , singleGet, historyGet } = require('../controllers/trackingController')

//kirim data dari device
router.post('/spost',singlePost)

//ambil data
router.get('/sget/:deviceId',singleGet)

//history data
router.get('/history/:deviceId', historyGet)

//ambil data laporan
// router.get('/sget/report/:device',getTrackReport)



module.exports = router