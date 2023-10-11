import { initServer } from "@ts-rest/express";
import { loginRouter, singupRouter } from "./User";
import { messageRouter } from "./Message";
import { contract } from "../contracts";
import { conversationRouter } from "./conversation";


const s = initServer();

export const router = s.router(contract, {
    login: loginRouter,
    getProfile:loginRouter,
    signup: singupRouter,
    addMessage: messageRouter,
    getMessage:messageRouter,
    createConversation:conversationRouter,
    getConversationById: conversationRouter,
    deleteConversationById:conversationRouter,
    addMembers:conversationRouter,
});
