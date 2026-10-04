import sqsClient from "./sqsClient.js"
import {ReceiveMessageCommand} from "@aws-sdk/client-sqs"
import {invokeDispatcher} from "./invokeLambda.js"
import "dotenv/config"

export const pollSqs=async(num:any)=>
    {
        try{
              const queueUrl = process.env.QUEUE_URL;

            invokeDispatcher(num.length);
            return;
        }
        catch(err){
            console.log(err)
            throw err
        }
         
        }
    