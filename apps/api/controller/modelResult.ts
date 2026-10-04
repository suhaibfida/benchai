import {Request,Response} from "express"
import {prisma} from "@repo/db/prisma"
export const modelResult=(req:Request,res:Response)=>{
    const id=req.id
    if(!id){
        return res.status(300).json({
                message:"Please login again"
        })
    }
    const result=prisma.model.findFirst({
        where:{
            userId:id
        }
    })
    const modelResult=prisma.modelResult.findFirst({
        where:{
            modelId:result.modelId
        }
    })
    return res.status(200).json({
        message:"Model result",
        result:{
            name:result.modelName,
            description:result.description,
            result:modelResult.geminiResult,
            tokensSpeed:modelResult.llammma,
            info:modelResult.info,
            time:modelResult.time
        }
    })
}