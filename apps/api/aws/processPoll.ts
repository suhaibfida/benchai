import {getSlots} from "./getDbSlots.js"
import {pollSqs} from "./pollSqs.js"
 const processPoll= async ()=>{
    try{ const num=await getSlots()
    setInterval( async()=>{
        
        if(num.length>0){
           await pollSqs(num);
        }
    },5000)}
    catch(err){
        console.log(err)
    }
   
}
export default processPoll