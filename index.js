const express = require('express')
const db = require("./connection")
const cors = require('cors')

require('dotenv').config()

const userRoutes = require('./routes/userRoutes')
const trackingRoutes = require('./routes/trackingRoutes')
const monitoringRoutes = require('./routes/monitoringRoutes')

const app = express()

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.get('/',(req,res)=>{
     res.json({
          mssg : "All is okay"
     })
})

app.use('/api/user',userRoutes)
app.use('/api/tracking', trackingRoutes)
app.use('/api/monitoring', monitoringRoutes)

app.listen(process.env.PORT,()=>{
     console.log(`Server is running on port ${process.env.PORT}`)
})