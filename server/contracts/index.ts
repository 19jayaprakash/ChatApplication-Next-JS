import { initContract } from "@ts-rest/core";
import { loginContract } from "./loginContract";
import { signupContract } from "./signupContract";
import { messageContract } from "./messageContract";
import {conversationContract } from "./conversationContract";

const c = initContract();

export const contract = c.router({
    login: loginContract,
    getProfile:loginContract,
    signup: signupContract,
    addMessage: messageContract,
    getMessage:messageContract,
    createConversation:conversationContract,
    getConversationById: conversationContract,
    deleteConversationById:conversationContract,
    addMembers:conversationContract,
    
})