import {Request,Response } from "express"
import crypto from "crypto"
import {prisma} from "@repo/db/prisma"
import putSignedUrl from "./../lib/putSignedUrl.js"
const signUrl=async (req:Request,res:Response)=>{
    const id=req.id;
    const model=req.body
    const key=`uploads/${id}/models/${crypto.randomUUID()}.gguf`

    const signedUrl=await putSignedUrl(key);
    if(!signedUrl){
            return res.status(400).json({
                message:"Internal server error"
            })
        }
            prisma.model.create({
        data:{
            modelName:model.user.create,
            key:key,
            status:"pending",
            description:model.description
        }
    })
    const findModel=prisma.user.findFirst({
        where:{
            key:key
        }
    })
    return res.status(200).json({
       message:"File location",
       modelId:findModel.id,
       link:signedUrl
    })
}
export default signUrl;
