import { PrismaClient } from '@prisma/client'
const jwt  = require('jsonwebtoken');
const bcrypt = require('bcrypt') ;

const prisma = new PrismaClient()

exports.auth = async ( req:any , res:any)=> {

    try{
        const {userName,email,password,} = req.body;

        const exitUser = await prisma.user.findUnique({
            where: {
              email: email,
            },
          })

        if (exitUser)
            return res.status(500).json({
                success : false,
                massage:"Email is already exist"
            });


            let hashedPassword;
            try{
              hashedPassword = await bcrypt.hash(password,10);
            }
            catch(err) {
              return res.status(500).json({
                success: false,
                message: "Server Error!"
              })
            }

            let newUser = await prisma.user.create({
                data: {
                  email: email,
                  userName: userName,
                  password: hashedPassword
                  
                },
              })
                
            return res.status(200).json({
                success:true,
                message: "User ban Gya jee",
                data:newUser
            })
       }
       catch(error){()=> {console.log('Error In SignUp',error)}
        }
    // await prisma.user.create({
    //     data: {
    //       userName: 'sushil11',
    //       email: 'sushil11@gmail.com',
    //       password: '123sushil12'
          
    //     },
    //   })
    //   const allUser = await prisma.user.findMany();
    //   console.log(allUser);
      
  }

  exports.logins =  async (req:any,res:any) => {
    
    try {
      const  {email,password} = req.body;
      if (!email || !password) {
        res.status(400).json({
            success:false,
            message: 'please fill  all fields'
         })
        };

      let newUser = await prisma.user.findUnique({
        where:{
            email:email
        }
      })
      console.log(newUser)
      if (!newUser) {
        return res.status(400).json({
            success:false,
            message:"please signup firstly"
          }) 
     };
      
     let payload ={
      email:newUser.email,
      id:newUser.id,

     }


      if (await bcrypt.compare(password,newUser.password)) {
           let token = jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn : "2h",
           });
          
         
          const option = {
            expires : new Date(Date.now()+1 * 24 * 60 *60 * 1000),
            httpOnly : true
          }

          res.cookie("userToken", token,option).status(200).json({
              success:true,
              newUser,
              token,
              message: 'User logged in Successfully'
          })


      }
      else{
        console.log('Error In Comparing Password');
            return res.status(500).json({
              success: false,
               message:'pasasword does not match'
       });
      }
       


    } catch (error) { 
      console.log(error);
       return res.status(500).json({
           success:false,
           message:"kuch gadbad hai"
       });
    }
};


