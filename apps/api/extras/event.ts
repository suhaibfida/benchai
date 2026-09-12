import {pollSqs} from "./pollSqs.js"
import {sandbox} from "./sandbox.js"
const handler=async (event:any)=>{4
    const length=event.length
   const messages= await pollSqs(length);
   for(const message of messages ){
     sandbox(message.body);

   }
}