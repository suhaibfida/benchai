import {SQSClient} from "@aws-sdk/client-sqs"
import "dotenv/config";
const  accessKeyId=process.env.AWS_ACCESS_KEY_ID
const secretAccessKey=process.env.AWS_SECRET_ACCESS_KEY
if(!accessKeyId || !secretAccessKey){
    throw new Error("Aws credentials missing")
};
let sqsClient:any;
try{ sqsClient =new SQSClient({
    region:"eu-north-1",
    credentials:{
        accessKeyId,
        secretAccessKey
    }
})}catch(err){console.log(err)}


export default sqsClient;