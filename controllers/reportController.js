const PDFDocument = require("pdfkit");
const fs = require("fs");
const db = require("../connection");

const getReportData = async (req, res) => {
  try {
    const { deviceId, day, month, year } = req.params;
    const data = await db.query(getMonitoringReport, [deviceId, day, month, year]);

    const pdfDoc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");

    pdfDoc.text(`Laporan Monitoring untuk Perangkat: ${deviceId} Tanggal: ${day}/${month}/${year}`);

    data.forEach((row) => {
      pdfDoc.text(`Tanggal: ${row.date}`);
      pdfDoc.text(`Waktu: ${row.time}`);
      pdfDoc.text(`Tegangan: ${row.tegangan}`);
      pdfDoc.text(`Arus: ${row.arus}`);
      pdfDoc.text(`Daya: ${row.daya}`);
      pdfDoc.text(`Baterai: ${row.baterai}`);
      pdfDoc.moveDown(); // Move down for better spacing between entries
    });

    pdfDoc.end();
    pdfDoc.pipe(res);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(400).json({ error: error.message });
  }
};

const getTrackReport = (req, res) => {
  const { deviceId, day, month, year } = req.params;
  getTrack = `SELECT * FROM tracking WHERE date = '${day}/${month}/${year}'`;
  db.query(getTrack, (err, fields) => {
    if (err) throw err;
    res.json({
      deviceId: deviceId,
      date: `${day}/${month}/${year}`,
      data: fields,
    });
  });
};

const getMonitoringReport = (req, res) => {
  const { deviceId, day, month, year } = req.params;
  // getTrack = `SELECT * FROM monitoring WHERE date= '${date}' ORDER BY time ASC`
  // getTrack = `SELECT DISTINCT date FROM monitoring;`
  // getTrack = `SELECT time FROM monitoring WHERE date='${date}' GROUP BY time HAVING COUNT(*) = 1`
  getHistory = `SELECT 
     AVG(tegangan) AS tegangan,
     AVG(arus) AS arus,
     AVG(daya) AS daya,
     AVG(baterai) AS baterai,
     DATE_FORMAT(MIN(STR_TO_DATE(time, '%H.%i.%s')), '%H:%i:%s') AS waktu
     FROM monitoring
     WHERE 
     device_id = '${deviceId}' 
     AND date = '${day}/${month}/${year}'
     AND HOUR(STR_TO_DATE(time, '%H.%i.%s')) BETWEEN 6 AND 18
     GROUP BY date, HOUR(STR_TO_DATE(time, '%H.%i.%s'));`;

  db.query(getHistory, (err, fields) => {
    if (err) throw err;
    res.json({
      deviceId: deviceId,
      date: `${day}/${month}/${year}`,
      data: fields,
    });
  });
};

module.exports = {
  getReportData,
  getTrackReport,
  getMonitoringReport,
};
