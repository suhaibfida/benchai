import {SQSClient} from "@aws-sdk/client-sqs"

const sqsClient =new SQSClient({
    region:"sqs.eu-north-1"
})
export default sqsClient;