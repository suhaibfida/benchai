import s3 from "../lib/s3Client.js"
import {GetObjectCommand} from "@aws-sdk/client-s3"
import {prisma} from "@repo/db/prisma"
import {Request,Response} from "express"
import "dotenv/config"
import sqs from "../lib/sqs.js"
const fileUploaded=async (req:Request,res:Response)=>{
    const model=req.body;
    if(model.status!=="200"){
        res.status(400).json({
            message:"File not uploaded successfully,please upload it again"
        })
    }
    else if(!model.modelId){
        res.status(400).json({
            message:"Model id is not present"
        })
         
    }
    const searchModel=prisma.model.findUnique({
        where:{
            id:model.modelId
        }
    })
    const checkModel=await s3.send(
        new GetObjectCommand({
            Bucket:"screenio-s3",
            Key:searchModel.key
})
    )
    if(!checkModel){
        res.status(400).json({
            message:"Model not found, Please check uploaded models"
        })
    }
    // sending s3moldel details to awsSQS
    sqs(searchModel.key);

    

}
export default fileUploaded;