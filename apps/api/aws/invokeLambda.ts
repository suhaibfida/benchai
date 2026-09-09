import {InvokeCommand} from "@aws-sdk/client-lambda"
import {lambdaClient} from "./lambdaClient.js"
export const invokeDispatcher=()=>{
    const dispatcher=lambdaClient.send(
    new InvokeCommand({
        FunctionName:"Model-Dispatcher",
        InvocationType:"Event"
    }));
}
