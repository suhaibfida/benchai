import {clientModal} from "./clientModal.js"
export const terminate=async ()=>{
    const sb=await clientModal.sandboxes.fromId("sb-ivjRgPf5ZfkvZ6ORAcOV2T")
    sb.terminate();
    console.log("terminated")
}
terminate();