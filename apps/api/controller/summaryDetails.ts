import {Request,Response} from "express"
import {prisma} from "@repo/db/prisma"
// job,
//     gemini_result,
//     llama_bench_result,
//     download_info,
//     time_metrics,
//     answers
const summaryDetails=async (req:Request,res:Response)=>{
    const {jobId,modelId,scores,summary,performance,model,benchmark}=req.body;
    // console.log(".............sadfasd.............")
    //  console.log(job,geminiResult,llamma,info,time,answers,req.body)
    const modelS=await prisma.model.update({
        where:{
            id:modelId
        },
        data:{
            jobId:jobId
        }
    })
    
     console.log(".............sadfasd.............",model)
    const user = await prisma.modelresults.create({
  data: {
    modelId: model.id,
    userId: model.userId,

    scores: JSON.stringify(scores),
    summary: JSON.stringify(summary),
    performance: JSON.stringify(performance),
    responseTime: JSON.stringify(performance.responseTime),
    modelInfo: JSON.stringify(model),
    benchmark: JSON.stringify(benchmark),

    model: {
      connect: {
        id: modelS.id
      }
    },
     user: {
      connect: {
        id: modelS.userId
      }
    }
  }
});
 console.log(user)
 return res.status(200).json({
    message:"Results added successfully",
    result:user
 })


}
export default summaryDetails;