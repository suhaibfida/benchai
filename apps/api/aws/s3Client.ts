import {S3Client} from "@aws-sdk/client-s3"
import "dotenv/config";
const  accessKeyId=process.env.AWS_ACCESS_KEY_ID
const secretAccessKey=process.env.AWS_SECRET__ACCESS_KEY
let s3:any;
try{
if(!accessKeyId || !secretAccessKey){
    throw new Error("Aws credentials missing")
};

s3=new S3Client({
    region:"ap-southeast-2",
    credentials:{
        accessKeyId,
        secretAccessKey
    }
})}catch(err){
    console.log(err)
}
export default s3;