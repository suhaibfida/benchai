import "dotenv/config"
import { ModalClient } from "modal";
const tokenId=process.env.MODAL_TOKEN_ID;
const tokenSecret=process.env.MODAL_TOKEN_SECRET
console.log(tokenId)
console.log(tokenSecret)
export const clientModal = new ModalClient({
    tokenId:process.env.MODAL_TOKEN_ID,
    tokenSecret:process.env.MODAL_TOKEN_SECRET
});