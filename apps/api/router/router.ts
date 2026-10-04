import {Router} from "express"
import signup from "../controller/signup.js"
import login from "../controller/login.js"
import signUrl from "../controller/signedUrl.js"
import authMiddleware from "../middleware/authMiddleware.js"
import checkFile from "../controller/checkFile.js"
import saveSandboxid from "../controller/saveSandboxId.js"
import summaryDetails from "../controller/summaryDetails.js"
import {checkModels} from "../controller/checkModels.js"
import {modelResult} from "../controller/modelResult.js"
export const router:Router=Router();

router.post("/api/v1/auth/signup",signup)
router.post("/api/v1/auth/login",login)
router.get("/api/v1/getpresignedurl",authMiddleware,signUrl)
router.post("/api/v1/response=200",authMiddleware,checkFile)
router.post("/api/v1/addsandboxid",saveSandboxid)
router.post("/api/v1/benchmark/results",summaryDetails)
router.post("/api/v1/user/models",authMiddleware,checkModels)
router.post("/api/v1/user/model/result",authMiddleware,modelResult)

