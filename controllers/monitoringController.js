const db = require("../connection")
const jwt = require('jsonwebtoken')

// Ambil data monitoring
const singleGet = async (req, res) => {
     const { deviceId } = req.params
     try {
          const { authorization } = req.headers
          if (!authorization) {
               return res.status(401).json({ error: "Authorization token required" })
          }
          const getToken = authorization.split(' ')[1]
          const { user_id } = jwt.verify(getToken, process.env.SECRET)
          const getUserId = `select device_access,role from user where user_id='${user_id}'`
          db.query(getUserId, (err, fields) => {
               if (fields[0].role == 1) {
                    const sql = `SELECT rt_arus,rt_tegangan,rt_daya,rt_baterai FROM device where device_Id='${deviceId}'`
                    db.query(sql, (err, datas) => {
                         if (err) return err;
                         res.status(200).json({ deviceId, datas })
                    })
               } else {
                    if (fields[0].device_access.includes(deviceId)) {
                         const sql = `SELECT rt_arus,rt_tegangan,rt_daya,rt_baterai FROM device where device_Id='${deviceId}'`
                         db.query(sql, (err, datas) => {
                              if (err) return err;
                              res.status(200).json({ deviceId, datas })
                         })
                    } else {
                         res.status(200).json({ mssg: "Anda tidak punya akses" })
                    }
               }
          })

     } catch (error) {
          res.status(400).json({ error: error.message })
     }
}

//Kirim data Monitoring
const singlePost = async (req, res) => {
     const { deviceId, datas } = req.body
     const currentdates = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Bangkok' }).split(',')
     const date = currentdates[0]
     const time = currentdates[1]
     try {
          const sqlAdd = `
          INSERT INTO monitoring(${`device_id`},${`tegangan`},${`arus`},${`daya`},${`baterai`}, ${`date`},time) 
          VALUES ('${deviceId}','${datas.tegangan}','${datas.arus}','${datas.daya}','${datas.baterai}','${date}', '${time}')
          `
          const sqlUpdate = `
          UPDATE device SET rt_tegangan='${datas.tegangan}', rt_arus='${datas.arus}',rt_daya='${datas.daya}',rt_baterai='${datas.baterai}' WHERE device_id='${deviceId}'
          `
          db.query(sqlUpdate, (err) => {
               if (err) throw err;
          })
          db.query(sqlAdd, (err) => {
               if (err) throw err;
               res.status(200).json({ deviceId, mode: "monitoring", mssg: "POST Berhasil" })
          })
     } catch (error) {
          res.status(400).json({ error: error.message })
     }
}

const graphGet = (req, res) => {
     const { deviceId, day, month,year } = req.params
     getGraph = `SELECT 
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
     GROUP BY date, HOUR(STR_TO_DATE(time, '%H.%i.%s'));`
     try {
          db.query(getGraph, (err, datas) => {
               if (err) throw err
               res.status(200).json({ deviceId: deviceId, date: date, data: datas })
          })
     } catch (error) {
          res.status(400).json({ error: error.message })
     }
}

module.exports = {
     singleGet,
     singlePost,
     graphGet
}