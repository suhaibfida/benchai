import {Router} from "express"
import signup from "../controller/signup.js"
import login from "../controller/login.js"
export const router:Router=Router();

router.post("/api/v1/auth/signup",signup)
router.post("/api/v1/auth/login",login)