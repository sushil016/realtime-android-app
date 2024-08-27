const express = require("express");
const router = express.Router();
const {auth} = require("../controllers/auth")
const {logins} = require("../controllers/auth")

router.post('/login' , logins )
router.post('/signup', auth)

router.get('/blog' ,  (req:any , res:any)=>{
    res.send({msg: 'Blog Page'})
})

module.exports = router