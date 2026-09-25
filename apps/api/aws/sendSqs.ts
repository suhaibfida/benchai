import getPresignedUrl from "./getSignedUrl.js"
import {SendMessageCommand} from "@aws-sdk/client-sqs"
import sqsClient from "./sqsClient.js"
import {prisma} from "@repo/db/prisma"
import "dotenv/config"
const sqs=async(key:string)=>{
    const model=await prisma.model.findFirst({
        where:{
            key:key
        }
    })
    console.log(process.env.QUEUE_URL)
    await sqsClient.send(
        new SendMessageCommand({
            QueueUrl:process.env.QUEUE_URL,
            MessageBody:JSON.stringify({
                modelId:model.modelId,
                getModelUrl:getPresignedUrl,
                // benchmarkTests:["Coding","Math","Reasoning","Coding","TokensPerSecond"]
            })
        })
    )
    console.log("sqs done")


}
export default sqs