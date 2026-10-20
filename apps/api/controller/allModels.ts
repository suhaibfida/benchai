import {prisma} from "@repo/db/prisma"
import {Request,Response} from "express"
export const allModels=async (req:Request,res:Response)=>{
    const results = await prisma.modelresults.findMany({
  include: {
    user: {
      select: {
        username: true,
      },
    },
  },
});

return res.status(200).json({
    results:results
})
}