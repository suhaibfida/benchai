import getPresignedUrl from "./getSignedUrl.js"
import {SendMessageCommand} from "@aws-sdk/client-sqs"
import sqsClient from "./sqsClient.js"
import {prisma} from "@repo/db/prisma"
import "dotenv/config"
const sqs=async(key:string)=>{
    const signedUrl=await getPresignedUrl(key);
    try{
        const model=await prisma.model.findFirst({
        where:{
            key:key
        }
    })
    console.log(model.id)
     console.log(".................")
    const send=await sqsClient.send(
        new SendMessageCommand({
            QueueUrl:process.env.QUEUE_URL,
            MessageBody:JSON.stringify({
                modelId:model.id,
                modelUrl:signedUrl
                // benchmarkTests:["Coding","Math","Reasoning","Coding","TokensPerSecond"]
            })
        })
    )
    console.log("sqs done",send)


    }catch(err){
        console.log(err)
    }
    
}
export default sqs