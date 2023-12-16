const express = require("express");
const router = express.Router();

const { getReportData,
     generatePdf,
     getMonitoringReport,
     getTrackReport } = require("../controllers/reportController");

// router.get("/sget/report/:deviceId", getReportData);
// router.post("/spost/report/:deviceId", generatePdf);


router.get("/tracking/:deviceId/:date", getTrackReport)
router.get("/monitoring/:deviceId/:date", getMonitoringReport)

module.exports = router;
