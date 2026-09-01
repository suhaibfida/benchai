import s3 from "../lib/s3Client.js"
import {Request,Response } from "express"
import crypto from "crypto"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {PutObjectCommand} from "@aws-sdk/client-s3"
const signUrl=async (req:Request,res:Response)=>{
    const id=req.id;
    const key=`uploads/${id}/models/${crypto.randomUUID()}.gguf`

    const putObjectCommand=new PutObjectCommand({
        Bucket:"screenio-s3",
        Key:key,
        ContentType:"application/octet-stream"

    })
    const preSignedUrl= await getSignedUrl(s3,putObjectCommand,{
        expiresIn:24*60*60
    })
    console.log(preSignedUrl)
    if(!preSignedUrl){
        return res.status(400).json({
            message:"Internal server error"
        })
    }
    return res.status(200).json({
       message:"File location",
       link:preSignedUrl
    })
}
export default signUrl;
