import {Request,Response} from "express"
import {prisma} from "@repo/db/prisma"
export const checkModels=(req:Request,res:Response)=>{
    const id=req.id
    if(!id){
        return res.status(300).json({
                message:"please login again"
        })
    }

    const models=prisma.model.findFirst({
        where:{
            userId:id
        }
    })
    return res.status(200).json({
        messages:"Models present here are :",
        models:models

    })




}