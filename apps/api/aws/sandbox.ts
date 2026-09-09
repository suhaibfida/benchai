import {clientModal} from "./clientModal.js"

export const sandbox=async ()=>{
    const app=await clientModal.apps.fromName("benchmark-app",{
        createIfMissing:true
    })
    console.log("ksjfn")
    const image=clientModal.images.fromRegistry("ubuntu:24.04");
    const sb = await clientModal.sandboxes.create(app, image, {
         command: ["sleep", "3600"],
         gpu: "T4",
         timeoutMs: 60 * 60 * 1000, 
        });
        console.log("Sandbox created",sb.sandboxId)

}
sandbox();