import { ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { SQSClient } from "@aws-sdk/client-sqs";
export const pollSqs = async (length) => {
    const sqsClient = new SQSClient({
        region: "eu-north-1",
    });
    const receiveMessage = await sqsClient.send(new ReceiveMessageCommand({
        QueueUrl: process.env.QUEUE_URL,
        MaxNumberOfMessages: length,
        WaitTimeSeconds: 20
    }));

    const messages = receiveMessage.Messages ?? [];
    console.log(messages)
    return messages;

    if (!messages) {
        throw new Error("nothing in message");
    }
    
};
