import {Request,Response} from "express"
import {prisma} from "@repo/db/prisma"
 const saveSandboxid=async (req:Request,res:Response)=>{
 console.log("fhxrfyjgh","000000000000000")
   try {
    const { modelId, messageId, sandboxId } = req.body;
    console.log("...........",modelId, messageId, sandboxId ,"000000000000000")

    console.log("SAVE SANDBOX REQUEST:", {
      modelId,
      messageId,
      sandboxId,
    });

    if (!modelId || !sandboxId) {
      return res.status(400).json({
        error: "modelId and sandboxId are required",
      });
    }

    // First check that model exists
    const model = await prisma.model.findFirst({
      where: {
        id:modelId
      },
    });

    if (!model) {
      return res.status(404).json({
        error: "Model not found",
        modelId,
      });
    }

    console.log("MODEL FOUND:", model.id);

    // Update model
    const updatedModel = await prisma.model.update({
      where: {
        id: model.id,
      },
      data: {
        
        sandboxId,
      },
    });

    console.log("SANDBOX ID SAVED:", updatedModel);

    return res.status(200).json({
      success: true,
      message: "Sandbox ID saved successfully",
      sandboxId,
    });

  } catch (error:any) {
    console.error("SAVE SANDBOX ERROR:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
   
 }
export default saveSandboxid;