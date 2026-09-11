import {InvokeCommand} from "@aws-sdk/client-lambda"
import {lambdaClient} from "./lambdaClient.js"
import {length} from "./getSlots.js"
export const invokeDispatcher=()=>{
    const dispatcher=lambdaClient.send(
    new InvokeCommand({
        FunctionName:"Model-Dispatcher",
        InvocationType:"RequestResponse",
        Payload:JSON.stringify({
            gpuSandboxLength:length
        })
    }));
}
