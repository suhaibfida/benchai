import clientModal from "./clientModal.js"
export const terminate=async (sandboxId:any)=>{
    const sb=await clientModal.sandboxes.fromId(sandboxId)
    await sb.terminate();
    console.log("terminated..............................................................................")
}