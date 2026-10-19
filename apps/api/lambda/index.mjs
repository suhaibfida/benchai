import { pollSqs } from "./pollSqs.js";
import { sandbox } from "./sandbox.js";

export const handler = async (event) => {
    const length = event.gpuSandboxLength;

    console.log("LENGTH:", length);
    console.log("QUEUE URL:", process.env.QUEUE_URL);

    const messages = await pollSqs(length);

    console.log("TOTAL MESSAGES:", messages.length);

    for (const message of messages) {
        console.log("RAW SQS MESSAGE:", message);

        if (!message.Body) {
            console.log("No Body");
            continue;
        }

        const data = JSON.parse(message.Body);

        console.log("PARSED BODY:", data);
        console.log("SQS MESSAGE ID:", message.MessageId);

        const sandboxMessage = {
            messageId: message.MessageId,
            modelId: data.modelId,
            modelUrl: data.modelUrl,
            receiptHandle: message.ReceiptHandle,
        };

        console.log("SENDING TO SANDBOX:", sandboxMessage);

        await sandbox(sandboxMessage);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Lambda completed",
            processed: messages.length,
        }),
    };
};