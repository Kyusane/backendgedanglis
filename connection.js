require("dotenv").config();
const mysql = require('mysql')

const db = mysql.createConnection({
     host :process.env.HOST_DB,
     user :process.env.USER_DB,
     password:process.env.PASSWORD_DB,
     database:process.env.DB_NAME
})

module.exports = db;
