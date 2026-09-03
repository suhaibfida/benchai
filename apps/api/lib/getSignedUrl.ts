import {GetObjectCommand} from "@aws-sdk/client-s3"
import {getSignedUrl} from "@aws-sdk/s3-request-presigner"
import s3 from "./s3Client.js"
const getPresignedUrl=async(key:string)=>{


    const object=new GetObjectCommand({
        Bucket:"screenio-s3",
        Key:key
    })
    const getUrl= await getSignedUrl(s3,object,{
        expiresIn:24*60*60
    })
    return getUrl;
    
}
export default getPresignedUrl