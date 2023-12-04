const express = require('express')
const router = express.Router()

const {singlePost , singleGet } = require('../controllers/trackingController')

//kirim data dari device
router.post('/spost',singlePost)

//ambil data
router.get('/sget/:deviceId',singleGet)

//ambil data laporan
// router.get('/sget/report/:device',getTrackReport)



module.exports = router