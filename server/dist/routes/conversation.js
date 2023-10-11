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
exports.conversationRouter = void 0;
const express_1 = require("@ts-rest/express");
const client_1 = require("@prisma/client");
const s = (0, express_1.initServer)();
const prisma = new client_1.PrismaClient();
const conversationContract_1 = require("../contracts/conversationContract");
const auth_1 = require("../middleware/auth");
exports.conversationRouter = s.router(conversationContract_1.conversationContract, {
    createConversation: {
        middleware: [auth_1.checkAuth],
        handler: ({ req }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { name, participants } = req.body;
                const conversation = yield prisma.conversation.create({
                    data: {
                        name,
                        participants: {
                            connect: participants.map((participant) => ({
                                id: participant
                            })),
                        }
                    },
                    include: {
                        participants: true,
                    }
                });
                const userConversation = yield prisma.userConversation.createMany({
                    data: participants.map((participant) => ({
                        userId: participant,
                        conversationId: conversation.id,
                    })),
                });
                console.log(userConversation);
                return {
                    status: 200,
                    body: conversation
                };
            }
            catch (error) {
                console.error('Error creating conversation:', error);
                return {
                    status: 500,
                    body: { message: "Error creating conversation" }
                };
            }
        })
    },
    getConversationById: {
        middleware: [auth_1.checkAuth], handler: ({ params, req }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { user } = req.user;
                let userId;
                if (user && typeof user === 'object' && 'id' in user) {
                    userId = user.id;
                }
                const conversationId = params.id;
                const conversation = yield prisma.conversation.findUnique({
                    where: { id: parseInt(conversationId.toString()) },
                    include: {
                        messages: true,
                        participants: true
                    }
                });
                if (!conversation) {
                    return {
                        status: 404,
                        body: { message: 'Conversation not found' }
                    };
                }
                const isParticipant = conversation.participants.some((participant) => participant.id === userId);
                if (!isParticipant) {
                    return {
                        status: 204,
                        body: "you are not a participant"
                    };
                }
                return {
                    status: 200,
                    body: conversation
                };
            }
            catch (error) {
                console.error('Error fetching conversation:', error);
                return {
                    status: 500,
                    body: { message: 'Internal Server Error' }
                };
            }
        })
    },
    deleteConversationById: {
        middleware: [auth_1.checkAuth], handler: ({ req, body }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const conversationId = req.params.id;
                const userId = body;
                const conversation = yield prisma.conversation.findUnique({
                    where: { id: parseInt(conversationId) },
                    include: {
                        participants: true
                    }
                });
                if (!conversation) {
                    return {
                        status: 404,
                        body: 'Conversation not found'
                    };
                }
                const isParticipant = yield prisma.userConversation.findFirst({
                    where: {
                        userId: userId.userId,
                        conversationId: parseInt(conversationId)
                    }
                });
                if (!isParticipant) {
                    return {
                        status: 405,
                        body: 'You are not authorized to delete this conversation'
                    };
                }
                yield prisma.userConversation.delete({
                    where: {
                        id: isParticipant.id
                    }
                });
                yield prisma.user.update({
                    where: {
                        id: userId.userId,
                    },
                    data: {
                        conversations: {
                            disconnect: {
                                id: parseInt(conversationId),
                            }
                        }
                    }
                });
                return {
                    status: 200,
                    body: 'Conversation deleted successfully'
                };
            }
            catch (error) {
                console.error('Error deleting conversation:', error);
                return {
                    status: 500,
                    body: 'Internal Server Error'
                };
            }
        })
    },
    addMembers: {
        middleware: [auth_1.checkAuth], handler: ({ body, req }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { participantId, conversationId } = body;
                const { user } = req.user;
                let userId;
                if (user && typeof user === 'object' && 'id' in user) {
                    userId = user.id;
                }
                const conversation = yield prisma.conversation.findUnique({
                    where: { id: conversationId }, include: { participants: true }
                });
                if (!conversation) {
                    return {
                        status: 404,
                        body: { message: 'Conversation not found' }
                    };
                }
                const isParticipant = conversation.participants.some((participant) => participant.id === userId);
                if (!isParticipant) {
                    return {
                        status: 405,
                        body: { message: 'you are not a participant of this conversation' }
                    };
                }
                const existingUserConversation = yield prisma.userConversation.findFirst({
                    where: {
                        userId: participantId,
                        conversationId,
                    },
                });
                if (existingUserConversation) {
                    return {
                        status: 202,
                        body: { message: 'User is already a member of this conversation' }
                    };
                }
                yield prisma.userConversation.create({
                    data: {
                        userId: participantId,
                        conversationId,
                    },
                });
                return {
                    status: 200,
                    body: { message: 'User added to the conversation' }
                };
            }
            catch (error) {
                console.error('Error adding member to conversation:', error);
                return {
                    status: 500,
                    body: { message: 'Internal Server Error' }
                };
            }
        })
    }
});
