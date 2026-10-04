import {InvokeCommand} from "@aws-sdk/client-lambda"
import {lambdaClient} from "./lambdaClient.js"
import {changeDbSlots} from "./changeDbSlots.js"
export const invokeDispatcher=async (length:any)=>{
    try{
        const dispatcher=await lambdaClient.send(
        // first set dyDB slots to running
    new InvokeCommand({
        FunctionName:"benchaiLambda",
        InvocationType:"RequestResponse",
        Payload: Buffer.from(JSON.stringify({
             gpuSandboxLength: length
})
    )}));
    console.log(dispatcher)
    // we will set the dynamo db slots to occupied with respect to how many sandboxes we created
    
    }
    catch(err){
        console.log(err)
    }
    await changeDbSlots(length);
    
}

