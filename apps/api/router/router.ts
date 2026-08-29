import {Router} from "express"
import signup from "../controller/signup.js"
export const router:Router=Router();

router.get("/api/v1/auth/signup",signup)