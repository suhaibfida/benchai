import {dbClient} from "./dynamoClient.js"
import {DynamoDBDocumentClient,ScanCommand} from "@aws-sdk/lib-dynamodb"
import "dotenv/config"

export const getSlots=async ()=>{
    let freeSlots:any;
    try{
        const db=DynamoDBDocumentClient.from(dbClient);

const result =await db.send(
    new ScanCommand({
            TableName: "sandboxes",
    FilterExpression:"#status= :free",
     ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues:{
        ":free":"free"
}
    })
)
 freeSlots=result.Items ?? [];



    }catch(err){
        console.log(err)
    }
    return freeSlots;

}
