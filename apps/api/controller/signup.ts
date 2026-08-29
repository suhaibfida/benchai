import {Request,Response} from "express";
import {prisma} from "@repo/db/prisma"
import {signupSchema} from "@repo/zod/zod"
import bcrypt from "bcrypt"
import "dotenv/config"

const signup=async (req:Request ,res:Response)=>{
    const salt=process.env.SALT;
    if(!salt){
        console.log("Salt not found")
        return res.status(500).json({
            message:"Something went wrong"
        })
    }
    const {username,email,password}=req.body
    const safeParse=signupSchema.safeParse({username,email,password})
    if(!safeParse.success){
        return res.status(400).json({
            message:safeParse.error
        })
    }
    const checkUser=await prisma.user.findFirst({
        where:{
            email:safeParse.data.email
        }
    })
      if(checkUser){
        return res.status(400).json({
            message:"Email already exists"
        })
      }
      const hash=bcrypt.hash(safeParse.data.password,salt)
      const create=await prisma.user.create({
        data:{
            username:safeParse.data.username,
            email:safeParse.data.email,
            password:hash
        }
      })  
      return res.status(200).json({
        message:"User registered successfully"
      }

      )


}
export default signup;