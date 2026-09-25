import {SQSClient} from "@aws-sdk/client-sqs"

const sqsClient =new SQSClient({
    region:"ap-southeast-2"
})
export default sqsClient;