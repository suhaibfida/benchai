import {S3Client} from "@aws-sdk/client-s3"
import "dotenv/config";
const  accessKeyId=process.env.AWS_ACCESS_KEY_ID
const secretAccessKey=process.env.AWS_SECRET__ACCESS_KEY
try{
if(!accessKeyId || !secretAccessKey){
    throw new Error("Aws credentials missing")
};

const s3=new S3Client({
    region:"eu-north-1",
    credentials:{
        accessKeyId,
        secretAccessKey
    }
})}catch(err){
    console.log(err)
}