const express = require("express");
const router = express.Router();

router.get('/blog' ,  (req:any , res:any)=>{
    res.send({msg: 'Blog Page'})
})

module.exports = router