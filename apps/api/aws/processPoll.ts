import {getSlots} from "./getDbSlots.js"
import {pollSqs} from "./pollSqs.js"
 const processPoll= async ()=>{
    const num=await getSlots()
    setInterval( ()=>{
        
        if(num.length>0){
            pollSqs(num);
        }
    },50000)
}
export default processPoll