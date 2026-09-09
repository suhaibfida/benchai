import getPresignedUrl from "./getSignedUrl.js"
import {SendMessageCommand} from "@aws-sdk/client-sqs"
import sqsClient from "./sqsClient.js"
import {prisma} from "@repo/db/prisma"
import "dotenv/config"
const sqs=async(key:string)=>{
    const model=await prisma.model.findUnique({
        where:{
            key:key
        }
    })
    await sqsClient.send(
        new SendMessageCommand({
            QueueUrl:process.env.QUEUEURL,
            MessageBody:JSON.stringify({
                modelId:model.modelId,
                getModelUrl:getPresignedUrl,
                benchmarkTests:["Coding","Math","Reasoning","Coding","TokensPerSecond"]
            })
        })
    )


}
export default sqs