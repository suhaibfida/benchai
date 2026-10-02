import sqsClient from "./sqsClient.js"
import {ReceiveMessageCommand} from "@aws-sdk/client-sqs"
import {invokeDispatcher} from "./invokeLambda.js"
import "dotenv/config"

export const pollSqs=async(num:any)=>
    {
        try{
              const queueUrl = process.env.QUEUE_URL;

            if (!queueUrl) {
                throw new Error("QUEUE_URL is not defined");
            }
            const response=await sqsClient.send(
        new ReceiveMessageCommand({
            QueueUrl:process.env.QUEUE_URL,
            MaxNumberOfMessages:num.length,
            WaitTimeSeconds:10
        })
     )
      const messages=response.Messages ?? [];
      if(messages.length>0)
        {
            invokeDispatcher(messages.length);
            return;
      }
        }
        catch(err){
            console.log(err)
            throw err
        }
         
        }
    