const PDFDocument = require("pdfkit");
const fs = require("fs");
const db = require("../connection");
const jwt = require("jsonwebtoken");

const getReportData = async (req, res) => {
  const { deviceId } = req.params;
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const getToken = authorization.split(" ")[1];
    const { user_id } = jwt.verify(getToken, process.env.SECRET);
    const getUserId = `select device_access,role from user where user_id='${user_id}'`;
    db.query(getUserId, (err, fields) => {
      if (fields[0].role == 1) {
        const sql = `SELECT rt_arus,rt_tegangan,rt_daya,rt_baterai FROM device where device_Id='${deviceId}'`;
        db.query(sql, (err, datas) => {
          if (err) throw err;
          res.status(200).json({ deviceId, datas });
          // Membuat file PDF menggunakan PDFKit
          const pdfDoc = new pdfkit();
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", "inline; filename=report.pdf");
          //Tambah Data dari Database
          results.forEach((row) => {
            pdfDoc.text(`Arus: ${row.rt_arus}`);
            pdfDoc.text(`Tegangan: ${row.rt_tegangan}`);
            pdfDoc.text(`Daya: ${row.rt_daya}`);
            pdfDoc.text(`Baterai: ${row.rt_baterai}`);
          });
          // Mengakhiri pembuatan file PDF
          pdfDoc.end();
          pdfDoc.pipe(res);
        });
      } else {
        if (fields[0].device_access.includes(deviceId)) {
          const sql = `SELECT rt_arus,rt_tegangan,rt_daya,rt_baterai FROM device where device_Id='${deviceId}'`;
          db.query(sql, (err, datas) => {
            if (err) throw err;
            res.status(200).json({ deviceId, datas });
          });
        } else {
          res.status(200).json({ mssg: "Anda tidak punya akses" });
        }
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTrackReport = (req, res) => {
  const { deviceId, date } = req.params
  getTrack = `SELECT * FROM tracking WHERE date=${date}`
  db.query(getTrack, (err, fields) => {
    res.json({
      deviceId: deviceId,
      data: fields
    })
  })
}

const getMonitoringReport = (req, res) => {
  const { deviceId, date } = req.params
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
     AND date = '${date}'
     AND HOUR(STR_TO_DATE(time, '%H.%i.%s')) BETWEEN 6 AND 18
     GROUP BY date, HOUR(STR_TO_DATE(time, '%H.%i.%s'));`

  db.query(getHistory, (err, fields) => {
    res.json({
      deviceId: deviceId,
      data: fields
    })
  })
}


module.exports = {
  getReportData,
  getTrackReport,
  getMonitoringReport
}
