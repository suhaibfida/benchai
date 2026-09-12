import {length} from "./getDbSlots.js"
import {pollSqs} from "./pollSqs.js"
 const processPoll=()=>{
    setInterval(()=>{
        if(length>0){
            pollSqs();
        }
    },100000)
}
export default processPoll