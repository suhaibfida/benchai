import {Request,Response} from "express"
import {loginSchema} from "@repo/zod/zod"
import bcrypt from "bcrypt"
import {prisma} from "@repo/db/prisma"
import jwt from "jsonwebtoken"
const login=async (req:Request,res:Response)=>{
    const jwtSecret=process.env.JWTSECRET
    if(!jwtSecret){
        console.log("JWT missing")
        return res.status(400).json({
            message:"Internal server error"
        })
    }
    const {email,password}=req.body
    const safeParse=loginSchema.safeParse({email,password})
    if(!safeParse.success){
        return res.status(400).json({
            message:safeParse.error
        })
    }
    const check=await prisma.user.findFirst({
        where:{
            email:safeParse.data.email
        }
    })
    if(!check){
        return res.status(400).json({
            message:"Email does not exist"
        })
    }
    const passwordCheck=bcrypt.compare(safeParse.data.password,check.password)
    if(!passwordCheck){
        return res.status(400).json({
            message:"Password did not match"
        })
    }
    const token=jwt.sign(check.id,jwtSecret)
    res.cookie("token",token,{
        maxAge:1000*60*60*24,
        httpOnly:true,
        sameSite:"lax",
        secure:true
    })
    return res.status(200).json({
        message:"Login successfull"
    })


     


}