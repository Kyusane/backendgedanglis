const express = require("express");
const router = express.Router();

const { getReportData, generatePdf } = require("../controllers/reportController");

router.get("sget/report/:deviceId", getReportData);
router.post("/spost/report/:deviceId", generatePdf);

module.exports = router;
