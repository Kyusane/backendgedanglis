const db = require("../connection")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const createToken = (user_id) => {
     return jwt.sign({ user_id }, process.env.SECRET, { expiresIn: '3d' })
}

//USER LOGIN
const userLogin = async (req, res) => {
     const { email, password } = req.body
     try {
          if (!email || !password) {
               res.status(400).json({ error: "All field must be Filled" })
          }
          const sql = `SELECT * FROM user where email='${email}'`
          db.query(sql, async (err, fields) => {
               if (err) throw err
               if (fields.length == 0) {
                    return res.status(400).json({ error: "Incorrect email" })
               }

               if (fields[0].isactive == 0) {
                    return res.status(400).json({ error: "Account dinonaktifkan" })
               }

               const matching = await bcrypt.compare(password, fields[0].password)
               if (!matching) {
                    return res.status(400).json({ error: "Incorrect password" })
               }

               const user = {
                    name: fields[0].name,
                    role: fields[0].role,
                    device_access: fields[0].device_access.split(",")
               }

               const token = createToken(fields[0].user_id)
               res.status(200).json({ email, token, user })
          })
     }
     catch (error) {
          res.status(400).json({ error: error.message })
     }
}

//USER CHANGE PASSWORD
const userChangePassword = async (req, res) => {
     const { newPassword } = req.body
     const { authorization } = req.headers

     try {
          if (!authorization) {
               return res.status(401).json({ error: "Authorization token required" })
          }

          const getToken = authorization.split(' ')[1]
          const { user_id } = jwt.verify(getToken, process.env.SECRET)

          const salt = await bcrypt.genSalt(10)
          const hash = await bcrypt.hash(newPassword, salt)

          const sqlUpdatePassword = `
          UPDATE user SET password='${hash}' WHERE user_id='${user_id}'
          `
          db.query(sqlUpdatePassword, (err) => {
               if (err) return err
               const token = createToken(user_id)
               res.status(200).json({ token: token })
          })
     } catch (error) {
          res.status(400).json({ error: error.message })
     }

}

//!!! ADMINISTRATOR ACCESS ONLY
const getUser = async (req, res) => {
     const { authorization } = req.headers
     try {
          if (!authorization) {
               return res.status(401).json({ error: "Authorization token required" })
          }

          const getToken = authorization.split(' ')[1]
          const { user_id } = jwt.verify(getToken, process.env.SECRET)

          sqlCheck = `SELECT * FROM admin where user_id ='${user_id}'`
          db.query(sqlCheck, (err, fields) => {
               if (err) return err
               if (fields.length == 0) {
                    return res.status(400).json({ error: "Anda tidak punya akses" })
               } else {
                    const getUser = `SELECT user_id,name,email,device_access, isactive from user WHERE role = 2`
                    db.query(getUser, (err, fields) => {
                         if (err) return err
                         res.status(200).json({ fields })
                    })
               }
          })
     } catch (error) {
          res.status(400).json({ error: error.message })
     }
}

const getDevice = async (req, res) => {
     const { authorization } = req.headers
     try {
          if (!authorization) {
               return res.status(401).json({ error: "Authorization token required" })
          }

          const getToken = authorization.split(' ')[1]
          const { user_id } = jwt.verify(getToken, process.env.SECRET)

          sqlCheck = `SELECT * FROM admin where user_id ='${user_id}'`
          db.query(sqlCheck, (err, fields) => {
               if (err) return err
               if (fields.length == 0) {
                    return res.status(400).json({ error: "Anda tidak punya akses" })
               } else {
                    const getUser = `SELECT user_id,device_id from device`
                    db.query(getUser, (err, fields) => {
                         if (err) return err
                         res.status(200).json({ fields })
                    })
               }
          })
     } catch (error) {
          res.status(400).json({ error: error.message })
     }
}

//USER SIGNUP
const userSignUp = async (req, res) => {
     const { user_id, name, email, password, role, device_access } = req.body
     try {
          if (!email || !password || !name || !user_id || !role || !device_access) {
               res.status(400).json({ error: "Semua data harus diisi" })
          }

          const sqlCheck = `SELECT * FROM user where email='${email}'`
          db.query(sqlCheck, (err, fields) => {
               if (err) return err
               if (fields.length != 0) {
                    return res.status(400).json({ error: "email sudah digunakan" })
               }
          })

          const salt = await bcrypt.genSalt(10)
          const hash = await bcrypt.hash(password, salt)
          const sqlSignUp = `INSERT INTO user (user_id, name, email, password, role, device_access, isactive) 
               VALUES ('${user_id}','${name}','${email}','${hash}','${role}','${device_access}','1')`

          db.query(sqlSignUp, (err) => {
               if (err) return err
               const token = createToken(user_id)
               res.status(200).json({ email: email, token: token })
          })
     }
     catch (error) {
          res.status(400).json({ error: error.message })
     }
}

//USER CHANGE DEVICE ACCESS
const userChangeDeviceAccess = async (req, res) => {
     const { newDeviceAccess, target } = req.body
     const { authorization } = req.headers

     try {
          if (!authorization) {
               return res.status(401).json({ error: "Authorization token required" })
          }

          const getToken = authorization.split(' ')[1]
          const { user_id } = jwt.verify(getToken, process.env.SECRET)

          sqlCheck = `SELECT * FROM admin where user_id ='${user_id}'`
          db.query(sqlCheck, (err, fields) => {
               if (err) return err
               if (fields.length == 0) {
                    return res.status(400).json({ error: "Anda tidak punya akses" })
               }
          })

          const sqlUpdateAccess = `
          UPDATE user SET device_access='${newDeviceAccess}' WHERE user_id='${target}'
          `
          db.query(sqlUpdateAccess, (err) => {
               if (err) return err
               res.status(200).json({ mssg: "Access diubah" })
          })
     } catch (error) {
          res.status(400).json({ error: error.message })
     }

}

//USER CHANGE ACCOUNT STATUS (IS ACTIVE)
const userChangeIsActive = async (req, res) => {
     const { isActive, target } = req.body
     const { authorization } = req.headers

     try {
          if (!authorization) {
               return res.status(401).json({ error: "Authorization token required" })
          }

          const getToken = authorization.split(' ')[1]
          const { user_id } = jwt.verify(getToken, process.env.SECRET)

          sqlCheck = `SELECT * FROM admin where user_id ='${user_id}'`
          db.query(sqlCheck, (err, fields) => {
               if (err) return err
               if (fields.length == 0) {
                    return res.status(400).json({ error: "Anda tidak punya akses" })
               }
          })

          const sqlUpdateAccess = `
          UPDATE user SET isactive='${isActive}' WHERE user_id='${target}'
          `
          db.query(sqlUpdateAccess, (err) => {
               if (err) return err
               res.status(200).json({ mssg: "Status account diubah" })
          })
     } catch (error) {
          res.status(400).json({ error: error.message })
     }

}

const userDelete = async (req,res) => {
     const { target } = req.body
     const { authorization } = req.headers
     try {
          if (!authorization) {
               return res.status(401).json({ error: "Authorization token required" })
          }

          const getToken = authorization.split(' ')[1]
          const { user_id } = jwt.verify(getToken, process.env.SECRET)

          sqlCheck = `SELECT * FROM admin where user_id ='${user_id}'`
          db.query(sqlCheck, (err, fields) => {
               if (err) return err
               if (fields.length == 0) {
                    return res.status(400).json({ error: "Anda tidak punya akses" })
               }
          })

          const sqlDelete = `
          DELETE FROM user WHERE user_id ='${target}'
          `
          db.query(sqlDelete, (err) => {
               if (err) return err
               res.status(200).json({ mssg: "Account dihapus" })
          })
     } catch (error) {
          res.status(400).json({ error: error.message })
     }

}

module.exports = {
     userLogin,
     userSignUp,
     userChangeDeviceAccess,
     userChangeIsActive,
     userChangePassword,
     userDelete,
     getUser,
     getDevice
}