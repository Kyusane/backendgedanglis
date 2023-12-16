const db = require("../connection")
const jwt = require('jsonwebtoken')

// Ambil data tracking
const trackingData = [
     {
          device_id: "GDL-001",
          rt_lat: "-7.475555",
          rt_long: "110.751536"
     },
     {
          device_id: "GDL-002",
          rt_lat: "-7.575555",
          rt_long: "110.451536"
     },
]
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
                    const data = trackingData.filter(d => d.device_id == deviceId)
                    res.status(200).json({
                         deviceId: deviceId,
                         position: {
                              rt_lat: data[0].rt_lat,
                              rt_long: data[0].rt_long,
                         }
                    })
               } else {
                    if (fields[0].device_access.includes(deviceId)) {
                         const data = trackingData.filter(d => d.device_id == deviceId)
                         res.status(200).json({
                              deviceId: deviceId,
                              position: {
                                   rt_lat: data[0].rt_lat,
                                   rt_long: data[0].rt_long,
                              }
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

//Kirim data tracking
const singlePost = async (req, res) => {
     const { deviceId, position } = req.body
     const currentdate = new Date();
     const date = currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear()
     const time = + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
     try {
          trackingData[0].rt_lat = position.lat
          trackingData[0].rt_long = position.long
          const sqlAdd = `
          INSERT INTO tracking(${`device_id`}, ${`lat`}, ${`lng`}, ${`date`} , time ) 
          VALUES ('${deviceId}','${position.lat}','${position.long}','${date}','${time}')
          `
          db.query(sqlAdd, (err) => {
               if (err) throw err;
               res.status(200).json({ deviceId, mode: "tracking", mssg: "POST Berhasil" })
          })
     } catch (error) {
          res.status(400).json({ error: error.message })
     }
}

const historyGet = async (req, res) => {
     const { deviceId, position } = req.body
}

module.exports = {
     singleGet,
     singlePost,
     historyGet,
}