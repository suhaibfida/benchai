import {length} from "./getDbSlots.js"
import {pollSqs} from "./pollSqs.js"
 const processPoll=()=>{
    setInterval(()=>{
        if(length>0){
            pollSqs();
        }
    },50000)
}
export default processPoll