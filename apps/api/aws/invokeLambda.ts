import {InvokeCommand} from "@aws-sdk/client-lambda"
import {lambdaClient} from "./lambdaClient.js"
import {length} from "./getDbSlots.js"
export const invokeDispatcher=()=>{
    const dispatcher=lambdaClient.send(
        // first set dyDB slots to running
    new InvokeCommand({
        FunctionName:"Model-Dispatcher",
        InvocationType:"RequestResponse",
        Payload:JSON.stringify({
            gpuSandboxLength:length
            // length of how many messages we are going to get from the queue, 
            // they should be equal to how many slots are available.
        })
    }));
}
