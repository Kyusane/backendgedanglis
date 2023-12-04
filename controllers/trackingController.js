const db = require("../connection")
const jwt = require('jsonwebtoken')

// Ambil data tracking
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
                    const sql = `SELECT rt_lat,rt_long FROM device where device_Id='${deviceId}'`
                    db.query(sql, (err, position) => {
                         if (err) throw err;
                         res.status(200).json({ deviceId, position })
                    })
               } else {
                    if (fields[0].device_access.includes(deviceId)) {
                         const sql = `SELECT rt_lat,rt_long FROM device where device_Id='${deviceId}'`
                         db.query(sql, (err, position) => {
                              if (err) throw err;
                              res.status(200).json({ deviceId, position })
                         })
                    }else{
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
     const date = currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/"+ currentdate.getFullYear()
     const time = + currentdate.getHours() + ":"+ currentdate.getMinutes() + ":"+ currentdate.getSeconds();
     
     try {
          const sqlAdd = `
          INSERT INTO tracking(${`device_id`}, ${`lat`}, ${`lng`}, ${`date`} , time ) 
          VALUES ('${deviceId}','${position.lat}','${position.long}','${date}','${time}')
          `
          const sqlUpdate = `
          UPDATE device SET rt_lat='${position.lat}', rt_long='${position.long}' WHERE device_id='${deviceId}'
          `
          db.query(sqlUpdate, (err) => {
               if (err) throw err;
          })

          db.query(sqlAdd, (err) => {
               if (err) throw err;
               res.status(200).json({ deviceId, mode: "tracking", mssg: "POST Berhasil" })
          })

     } catch (error) {
          res.status(400).json({ error: error.message })
     }
}

module.exports = {
     singleGet,
     singlePost
}