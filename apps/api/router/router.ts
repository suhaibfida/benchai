import {Router} from "express"
import signup from "../controller/signup.js"
import login from "../controller/login.js"
import signUrl from "../controller/signedUrl.js"
import authMiddleware from "../middleware/authMiddleware.js"
import checkFile from "../controller/checkFile.js"
export const router:Router=Router();

router.post("/api/v1/auth/signup",signup)
router.post("/api/v1/auth/login",login)
router.get("/api/v1/getpresignedurl",authMiddleware,signUrl)
router.get("/api/v1/checkfile",authMiddleware,checkFile)

