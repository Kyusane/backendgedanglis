const jwt = require('jsonwebtoken')
const db = require('../connection')
require('dotenv')

const requireAuth = async (req,res,next) =>{
     //verify authentification
     const { authorization } = req.headers
     if(!authorization){
          return res.status(401).json({error : "Authorization token required"})
     }

     const token = authorization.split(' ')[1]
     try{
          const {_id} = jwt.verify(token, process.env.SECRET)
          req.user = await db.query(`select email from user where email='${_id}'`)
          next()

     }catch(error){
          res.status(401).json({error : "Request is not authorized"})
     }
}

module.exports = requireAuth