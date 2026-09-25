import s3 from "../aws/s3Client.js"
import {GetObjectCommand} from "@aws-sdk/client-s3"
import {prisma} from "@repo/db/prisma"
import {Request,Response} from "express"
import "dotenv/config"
import sqs from "../aws/sendSqs.js"
const checkFile=async (req:Request,res:Response)=>{
    const model=req.body;
    console.log(model)
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
    const searchModel=await prisma.model.findFirst({
        where:{
            id:model.modelId
        }
    })
    console.log(searchModel.key)
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
    console.log("working")
    // sending s3moldel details to awsSQS
    sqs(searchModel.key);

    

}
export default checkFile;