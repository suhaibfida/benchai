import {ReceiveMessageCommand} from "@aws-sdk/client-sqs"
import {SQSClient} from "@aws-sdk/client-sqs"
import "dotenv/config"
export const pollSqs=async (length:any)=>{
    const sqsClient=new SQSClient({
        region:"ap-south-1"}
    )
    const receiveMessage:any=await sqsClient.send(
        new ReceiveMessageCommand({
            QueueUrl:process.env.QUEUE_URL,
            MaxNumberOfMessages:length,
            WaitTimeSeconds:10
        })
    )
    const messages=JSON.parse(receiveMessage.Messages);
    if(!messages){
        throw new Error("nothing in message")
    }
  
    return messages;
}