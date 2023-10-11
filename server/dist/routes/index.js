"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("@ts-rest/express");
const User_1 = require("./User");
const Message_1 = require("./Message");
const contracts_1 = require("../contracts");
const conversation_1 = require("./conversation");
const s = (0, express_1.initServer)();
exports.router = s.router(contracts_1.contract, {
    login: User_1.loginRouter,
    getProfile: User_1.loginRouter,
    signup: User_1.singupRouter,
    addMessage: Message_1.messageRouter,
    getMessage: Message_1.messageRouter,
    createConversation: conversation_1.conversationRouter,
    getConversationById: conversation_1.conversationRouter,
    deleteConversationById: conversation_1.conversationRouter,
    addMembers: conversation_1.conversationRouter,
});
