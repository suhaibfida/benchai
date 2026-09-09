import {LambdaClient} from "@aws-sdk/client-lambda"
export const lambdaClient=new LambdaClient({
    region:"ap-south-1"
})