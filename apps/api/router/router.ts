import {Router} from "express"
import {health} from "./../controller/health"
import {signUp} from "./../controller/register.ts"
export const router= Router();
router.get("/health",health);
router.post("/signup",signUp)