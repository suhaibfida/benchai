import {dbClient} from "./dynamoClient.js"
import {DynamoDBDocumentClient,ScanCommand} from "@aws-sdk/lib-dynamodb"
import "dotenv/config"

const db=DynamoDBDocumentClient.from(dbClient);

const result =await db.send(
    new ScanCommand({
            TableName: "GpuSlots",
    FilterExpression:"#status= :free",
    ExpressionAttributeValues:{
        ":free":"free"
    
}
    })
)
const freeSlots=result.Items ?? [];
export const length=freeSlots.length;
