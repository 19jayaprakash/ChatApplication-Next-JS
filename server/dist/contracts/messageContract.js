"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageContract = void 0;
const core_1 = require("@ts-rest/core");
const zod_1 = require("zod");
const c = (0, core_1.initContract)();
const messageInput = zod_1.z.object({ text: zod_1.z.string(), conversationId: zod_1.z.number() });
exports.messageContract = c.router({
    addMessage: {
        method: "POST",
        path: "/message",
        headers: zod_1.z.object({ 'x-auth-token': zod_1.z.string() }),
        body: messageInput,
        responses: {
            404: zod_1.z.object({ message: zod_1.z.string() }),
            200: zod_1.z.object({
                id: zod_1.z.number(),
                text: zod_1.z.string(),
                senderId: zod_1.z.string(),
                conversationId: zod_1.z.number(),
                createdAt: zod_1.z.date(),
            }),
            500: zod_1.z.object({ message: zod_1.z.string() })
        }
    },
    getMessage: {
        method: 'GET',
        path: '/messages/:id',
        headers: zod_1.z.object({ 'x-auth-token': zod_1.z.string() }),
        query: zod_1.z.object({ lastFetched: zod_1.z.string().optional() }),
        responses: {
            200: zod_1.z.object({
                messages: zod_1.z.array(zod_1.z.object({
                    id: zod_1.z.number(),
                    text: zod_1.z.string(),
                    senderId: zod_1.z.string()
                })),
                lastFetched: zod_1.z.date().optional(),
            }),
            404: zod_1.z.object({ message: zod_1.z.string() }),
            500: zod_1.z.object({ message: zod_1.z.string() })
        }
    }
});
