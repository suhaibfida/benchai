
import express from "express";
import {router} from "./router/router.js" 
import cookieParser from "cookie-parser"
import cors from "cors"
const PORT=process.env.PORT
const app=express();
app.use(cookieParser());
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))
app.use(express.json())
app.use(router)
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
});