import {LambdaClient} from "@aws-sdk/client-lambda"
const  accessKeyId=process.env.AWS_ACCESS_KEY_ID
const secretAccessKey=process.env.AWS_SECRET_ACCESS_KEY
if(!accessKeyId || !secretAccessKey){
    throw new Error("Aws credentials missing")
};

export const lambdaClient=new LambdaClient({
    region:"ap-south-1",
     credentials:{
        accessKeyId,
        secretAccessKey
    }
})