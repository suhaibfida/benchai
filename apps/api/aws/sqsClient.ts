import {SQSClient} from "@aws-sdk/client-sqs"
import "dotenv/config";
const  accessKeyId=process.env.AWS_ACCESS_KEY_ID
const secretAccessKey=process.env.AWS_SECRET_ACCESS_KEY
if(!accessKeyId || !secretAccessKey){
    throw new Error("Aws credentials missing")
};

const sqsClient =new SQSClient({
    region:"ap-southeast-2",
    credentials:{
        accessKeyId,
        secretAccessKey
    }
})

export default sqsClient;