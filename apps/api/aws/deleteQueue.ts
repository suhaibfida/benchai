import sqsClient from "./sqsClient.js"
import {DeleteMessageCommand} from "@aws-sdk/client-sqs"
export const queue=async (receiptHandle:any)=>{
    const queueUrl = process.env.QUEUE_URL;

  if (!queueUrl) {
    throw new Error("QUEUE_URL is missing");
  }

  await sqsClient.send(
    new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    })
  );

  console.log("SQS message deleted successfully");
    
}