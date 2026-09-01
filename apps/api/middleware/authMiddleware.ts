import {Request,Response,NextFunction} from "express"
import jwt,{JwtPayload} from "jsonwebtoken"
import "dotenv/config"

 declare global{
    namespace Express{
        interface Request{
            id?:string
        }
    }
 }
const authMiddleware=(req:Request,res:Response,next:NextFunction)=>{
    try{
    const jwtSecret=process.env.JWT_SECRET;
    if(!jwtSecret){
        console.error("JWT MISSING")
        return res.status(500).json({
            message:"Something went wrong"
        })
    }
    const cookie=req.cookies;
    if(!cookie){
        return res.status(400).json({
            message:"Please login again"
        })
    }
    const verify=jwt.verify(cookie.token,jwtSecret);
    if(!verify){
        return res.status(400).json({
            message:"Please logout and then login again"
        })
    }
    req.id=(verify as JwtPayload).token
    next();}
    catch(err){
        console.error(err)
    }
}
export default authMiddleware;