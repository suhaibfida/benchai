import {z} from "zod";

export const signupSchema=z.object({
    username:z.string().min(3).max(15),
    email:z.email(),
    password:z.string().min(8).max(50)
})
export const loginSchema=z.object({
    email:z.email(),
    password:z.string().min(8).max(50)
})