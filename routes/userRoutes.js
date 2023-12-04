const express = require('express')
const router = express.Router()

const {userLogin, 
     userSignUp,
     userChangeDeviceAccess,
     userChangeIsActive,
     userChangePassword,
     userDelete,
     getUser,
     getDevice} = require('../controllers/userController')

router.post('/login',userLogin)
router.post('/signup',userSignUp)

//ADMINISTRATOR ONLY
router.post('/change/deviceaccess',userChangeDeviceAccess)
router.post('/change/isactive',userChangeIsActive)
router.delete('/delete',userDelete)

router.get('/administrator/getuser',getUser)
router.get('/administrator/getdevice',getDevice)

//USER ONLY
router.post('/change/password',userChangePassword)


module.exports = router