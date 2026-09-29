import {Request,Response} from "express"
import {prisma} from "@repo/db/prisma"
// job,
//     gemini_result,
//     llama_bench_result,
//     download_info,
//     time_metrics,
//     answers
const summaryDetails=(req:Request,res:Response)=>{
    const {job,geminiResult,llamma,info,time,answers}=req.body;
    const model=prisma.model.findFirst({
        where:{
            jobId:job
        }
    })
    const user=prisma.modelResults.create({
        data:{
            modelId:model.modelId,
            userId:model.userId,
            geminiResult:geminiResult,
            llama:llamma,
            info:info,
            time:time,
            answers:answers

        }
    })



}
export default summaryDetails;