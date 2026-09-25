import "dotenv/config";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const  accessKeyId=process.env.AWS_ACCESS_KEY_ID
const secretAccessKey=process.env.AWS_SECRET_ACCESS_KEY
if(!accessKeyId || !secretAccessKey){
    throw new Error("Keyss are missing")
}

const dbClient=new DynamoDBClient({
    region:"eu-north-1",
    credentials:{
        accessKeyId:accessKeyId,
        secretAccessKey:secretAccessKey
    }
    
})
export {dbClient}
