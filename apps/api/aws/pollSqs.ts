import sqsClient from "./sqsClient.js"
import {ReceiveMessageCommand} from "@aws-sdk/client-sqs"
import {invokeDispatcher} from "./invokeLambda.js"
import "dotenv/config"
export const pollSqs=async()=>
    {
        
            const response=await sqsClient.send(
        new ReceiveMessageCommand({
            QueueUrl:process.env.QUEUE_URL,
            MaxNumberOfMessages:6,
            WaitTimeSeconds:10
        })
     )
      const messages=response.Messages ?? [];
      if(messages.length>0)
        {
            invokeDispatcher();
            return;
      }
        }
    