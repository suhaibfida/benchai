import {Request,Response} from "express"
import {prisma} from "@repo/db/prisma"
 const saveSandboxid=async (req:Request,res:Response)=>{

    const {modelId,jobId,sandboxId}=JSON.parse(req.body)

    const check=await prisma.model.findFirst({
        where:{
            modelId:modelId
        }
        ,data:{
            jobId:jobId,
            sandboxId:sandboxId
        }
    })
    if(!check){
        res.json({
            message:"ModelId not present"
        })
    }
   
 }
export default saveSandboxid;