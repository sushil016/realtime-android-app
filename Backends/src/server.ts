const express = require("express")
const app = express()
const AdminRoute = require("./routes/myRoute")
require("dotenv").config();
app.use(express.json());

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    await prisma.user.create({
        data: {
          userName: 'sushil11',
          email: 'sushil11@gmail.com',
          password: '123sushil12'
          
        },
      })
      const allUser = await prisma.user.findMany();
      console.log(allUser);
      
  }

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

const PORT = process.env.PORT

app.get("/" , (req:any, res:any )=>{res.send('Hello Worldeeee')})

app.use('/api/v2', AdminRoute);

app.listen(PORT , () => {
    console.log(`server is running on  port ${PORT}`)
})

