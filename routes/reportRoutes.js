const express = require("express");
const router = express.Router();

const { getReportData, getMonitoringReport, getTrackReport } = require("../controllers/reportController");

// router.get("/sget/report/:deviceId", getReportData);
// router.post("/spost/report/:deviceId", generatePdf);

router.get("/tracking/:deviceId/:day/:month/:year", getTrackReport);
router.get("/monitoring/:deviceId/:day/:month/:year", getMonitoringReport);
router.get("/report/:day/:month/:year", getReportData);

module.exports = router;
