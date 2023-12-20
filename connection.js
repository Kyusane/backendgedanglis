const mysql = require('mysql')
// const db = mysql.createConnection({
//      host :"127.0.0.1", 
//      user :"root",
//      password:"TVZ455r11zBlpFRl",
//      database:"mbkmgedanglis"
// })

const db = mysql.createConnection({
     host :"127.0.0.1",
     user :"root",
     password:"",
     database:"mbkmgedanglis"
})

module.exports = db;
