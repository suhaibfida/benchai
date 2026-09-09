import {ReceiveMessageCommand} from "@aws-sdk/client-sqs"
import {SQSClient} from "@aws-sdk/client-sqs"
import "dotenv/config"
export const pollSqs=async ()=>{
    const sqsClient=new SQSClient({
        region:"ap-south-1"}
    )
    const receiveMessage=await sqsClient.send(
        new ReceiveMessageCommand({
            QueueUrl:process.env.QUEUE_URL,
            MaxNumberOfMessages:2,
            WaitTimeSeconds:10
        })
    )
    const message=receiveMessage.Messages?.[0];
    if(!message?.Body){
        throw new Error("")
    }
    const parsedMessage=JSON.parse(message.Body)
    return parsedMessage;
}