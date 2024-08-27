const express = require("express")
const app = express()
const AdminRoute = require("./routes/myRoute")
const signupRoute = require("./routes/myRoute")
const signinRoute = require("./routes/myRoute")
require("dotenv").config();
app.use(express.json());

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    log: ["query"]
})

const PORT = process.env.PORT || 8000

app.get("/" , (req:any, res:any )=>{res.send('Hello Worldeeee')})

app.use('/api/v2', AdminRoute);
app.use('/api/v2', signinRoute);
app.use('/api/v2', signupRoute);

app.listen(PORT , () => {
    console.log(`server is running on  port ${PORT}`)
})

