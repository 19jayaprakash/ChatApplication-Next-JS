"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationContract = void 0;
const core_1 = require("@ts-rest/core");
const zod_1 = require("zod");
const c = (0, core_1.initContract)();
const conversationInput = zod_1.z.object({
    name: zod_1.z.string(),
    participants: zod_1.z.array(zod_1.z.number())
});
const deleteInput = zod_1.z.object({ userId: zod_1.z.number() });
const addMemberInput = zod_1.z.object({ participantId: zod_1.z.number(), conversationId: zod_1.z.number() });
exports.conversationContract = c.router({
    createConversation: {
        method: 'POST',
        path: '/createConversation',
        headers: zod_1.z.object({ "x-auth-token": zod_1.z.string() }),
        body: conversationInput,
        responses: {
            200: zod_1.z.object({
                name: zod_1.z.string(),
                participants: zod_1.z.array(zod_1.z.object({ username: zod_1.z.string() }))
            }),
            500: zod_1.z.object({ message: zod_1.z.string() })
        }
    },
    getConversationById: {
        method: 'GET',
        path: '/getConversation/:id',
        headers: zod_1.z.object({ 'x-auth-token': zod_1.z.string() }),
        responses: {
            200: zod_1.z.object({
                id: zod_1.z.number(),
                name: zod_1.z.string(),
                createdAt: zod_1.z.date(),
                updatedAt: zod_1.z.date(),
                participants: zod_1.z.array(zod_1.z.object({
                    id: zod_1.z.number(),
                    username: zod_1.z.string(),
                })),
                messages: zod_1.z.array(zod_1.z.object({
                    id: zod_1.z.number(),
                    text: zod_1.z.string(),
                    senderId: zod_1.z.number(),
                    conversationId: zod_1.z.number(),
                    createdAt: zod_1.z.date()
                })),
            }),
            404: zod_1.z.object({ message: zod_1.z.string() }),
            500: zod_1.z.object({ message: zod_1.z.string() })
        }
    },
    deleteConversationById: {
        method: 'DELETE',
        path: '/deleteConversation/:id',
        headers: zod_1.z.object({ 'x-auth-token': zod_1.z.string() }),
        body: deleteInput,
        responses: {
            404: zod_1.z.string(),
            405: zod_1.z.string(),
            200: zod_1.z.string(),
            500: zod_1.z.string()
        }
    },
    addMembers: {
        method: 'POST',
        path: '/addMembers',
        headers: zod_1.z.object({ 'x-auth-token': zod_1.z.string() }),
        body: addMemberInput,
        responses: {
            404: zod_1.z.object({ message: zod_1.z.string() }),
            405: zod_1.z.object({ message: zod_1.z.string() }),
            200: zod_1.z.object({ message: zod_1.z.string() }),
            500: zod_1.z.object({ message: zod_1.z.string() }),
        }
    }
});
