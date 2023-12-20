const express = require("express");
const router = express.Router();

const { singlePost, singleGet, historyGet, trackingGet } = require("../controllers/trackingController");

//kirim data dari device
router.post("/spost", singlePost);

//ambil data
router.get("/sget/:deviceId", singleGet);
router.get("/sget/none/:deviceId", trackingGet);

//history data
router.get("/history/:deviceId/:day/:month/:year", historyGet);

//ambil data laporan
// router.get('/sget/report/:device',getTrackReport)

module.exports = router;
