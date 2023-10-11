"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRouter = void 0;
const express_1 = require("@ts-rest/express");
const client_1 = require("@prisma/client");
const messageContract_1 = require("../contracts/messageContract");
const auth_1 = require("../middleware/auth");
const prisma = new client_1.PrismaClient();
const s = (0, express_1.initServer)();
exports.messageRouter = s.router(messageContract_1.messageContract, {
    addMessage: {
        middleware: [auth_1.checkAuth],
        handler: ({ req, body }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { text, conversationId } = body;
                const userId = getUserIdFromRequest(req);
                const conversation = yield findConversation(conversationId.toString());
                console.log(conversation, 'conversation');
                if (!conversation) {
                    return {
                        status: 404,
                        body: { message: "Conversation not found" }
                    };
                }
                if (!isUserParticipant(userId, conversation)) {
                    return {
                        status: 403,
                        body: { message: "You are not a participant in this conversation" }
                    };
                }
                if (text && conversationId) {
                    const newMessage = yield createMessage(text, userId, conversationId);
                    return {
                        status: 200,
                        body: newMessage,
                    };
                }
                return {
                    status: 400,
                    body: { message: "From, to, and Message are required." },
                };
            }
            catch (err) {
                return {
                    status: 500,
                    body: { message: "Message internal server error" },
                };
            }
        }),
    },
    getMessage: {
        middleware: [auth_1.checkAuth],
        handler: ({ req, query }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const conversationId = req.params.id;
                const userId = getUserIdFromRequest(req);
                const { lastFetched } = query;
                const currentTime = new Date();
                const conversation = yield findConversation(conversationId);
                if (!conversation) {
                    return {
                        status: 404,
                        body: { message: "Conversation not found" },
                    };
                }
                if (!isUserParticipant(userId, conversation)) {
                    return {
                        status: 403,
                        body: { message: "You are not a participant in this conversation" },
                    };
                }
                let messages = [];
                let updatedLastFetched;
                if (lastFetched) {
                    const lastFetchedTime = new Date(lastFetched);
                    messages = yield findMessagesByTimeRange(conversation.id, lastFetchedTime, currentTime);
                    updatedLastFetched = currentTime;
                }
                else {
                    messages = yield findMessages(conversation.id);
                    updatedLastFetched = currentTime;
                }
                return {
                    status: 200,
                    body: { messages: messages, lastFetched: updatedLastFetched },
                };
            }
            catch (err) {
                console.error(err);
                return {
                    status: 500,
                    body: { message: "Message internal server error" },
                };
            }
        }),
    }
});
function getUserIdFromRequest(req) {
    const { user } = req.user;
    if (user && typeof user === 'object' && 'id' in user) {
        return user.id;
    }
    console.log("Invalid user");
    throw new Error("Invalid user");
}
function findConversation(conversationId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma.conversation.findUnique({
            where: { id: parseInt(conversationId) },
            include: { participants: true },
        });
    });
}
function isUserParticipant(userId, conversation) {
    return conversation.participants.some((participant) => participant.id === userId);
}
function createMessage(text, userId, conversationId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma.message.create({
            data: {
                text,
                senderId: userId,
                conversationId,
            },
        });
    });
}
function findMessages(conversationId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma.message.findMany({
            where: { conversationId: conversationId },
            select: { id: true, text: true, senderId: true },
        });
    });
}
function waitForNewMessages(conversationId, currentMessages) {
    return __awaiter(this, void 0, void 0, function* () {
        const timeoutMs = 1000;
        const startTime = Date.now();
        while (true) {
            const newMessages = yield prisma.message.findMany({
                where: {
                    conversationId: conversationId,
                    createdAt: { gte: new Date(startTime) },
                },
                select: { id: true, text: true, senderId: true },
            });
            if (newMessages.length > 0) {
                currentMessages = [...currentMessages, ...newMessages];
                break;
            }
            yield new Promise((resolve) => setTimeout(resolve, timeoutMs));
        }
        return currentMessages;
    });
}
function findMessagesByTimeRange(conversationId, startTime, endTime) {
    return __awaiter(this, void 0, void 0, function* () {
        const messages = yield prisma.message.findMany({
            where: {
                conversationId: conversationId,
                createdAt: {
                    gte: startTime,
                    lte: endTime,
                },
            },
            select: {
                id: true,
                text: true,
                senderId: true,
            },
        });
        return messages;
    });
}
