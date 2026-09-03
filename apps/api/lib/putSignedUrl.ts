import {PutObjectCommand} from "@aws-sdk/client-s3"
import {getSignedUrl} from "@aws-sdk/s3-request-presigner"
import s3 from "./s3Client.js"
const putSignedUrl=async(key:string)=>{
    const putObjectCommand=new PutObjectCommand({
            Bucket:"screenio-s3",
            Key:key,
            ContentType:"application/octet-stream"
        })
        const preSignedUrl= await getSignedUrl(s3,putObjectCommand,{
            expiresIn:24*60*60
        })
        return preSignedUrl;
        
}
export default putSignedUrl;