"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contract = void 0;
const core_1 = require("@ts-rest/core");
const loginContract_1 = require("./loginContract");
const signupContract_1 = require("./signupContract");
const messageContract_1 = require("./messageContract");
const conversationContract_1 = require("./conversationContract");
const c = (0, core_1.initContract)();
exports.contract = c.router({
    login: loginContract_1.loginContract,
    getProfile: loginContract_1.loginContract,
    signup: signupContract_1.signupContract,
    addMessage: messageContract_1.messageContract,
    getMessage: messageContract_1.messageContract,
    createConversation: conversationContract_1.conversationContract,
    getConversationById: conversationContract_1.conversationContract,
    deleteConversationById: conversationContract_1.conversationContract,
    addMembers: conversationContract_1.conversationContract,
});
