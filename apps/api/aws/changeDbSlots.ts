import {getSlots} from "./getDbSlots.js"
import {dbClient} from "./dynamoClient.js"
import {DynamoDBDocumentClient,UpdateCommand} from "@aws-sdk/lib-dynamodb"
export const changeDbSlots=async (length:any)=>{
    const freeSlots:any=await getSlots();
    const slotsToRun=(freeSlots.Items??[]).slice(0,length);
      const db=DynamoDBDocumentClient.from(dbClient);
  for (const slot of slotsToRun) {
  await db.send(
    new UpdateCommand({
      TableName: "GpuSlots",
      Key: {
        slotId: slot.slotId!,
      },
      UpdateExpression: "SET #status = :running",
      ConditionExpression: "#status = :free",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":running": { S: "RUNNING" },
        ":free": { S: "FREE" },
      },
    })
  );
}
}