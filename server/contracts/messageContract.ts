import { initContract } from "@ts-rest/core";
import { any, z } from "zod";

const c = initContract();

const messageInput = z.object({ text: z.string(),conversationId: z.number()});

export const messageContract = c.router({
    addMessage: {
        method: "POST",
        path: "/message",
        headers: z.object({'x-auth-token':z.string()}),
        body: messageInput,
        responses: {
            404: z.object({message: z.string()}),
            200: z.object({
                id: z.number(),
                text: z.string(),
                senderId:z.string(),
                conversationId: z.number(),
                createdAt: z.date(),
                }),
            500:z.object({message: z.string()})
        }
    },
    getMessage:{
        method: 'GET',
        path: '/messages/:id',
        headers: z.object({'x-auth-token':z.string()}),
        query: z.object({ lastFetched: z.string().optional() }),
        responses:{
            200:z.object({
                    messages:z.array(
                    z.object({
                    id: z.number(),
                    text: z.string(),
                    senderId: z.string()
                    })
                ),
                lastFetched: z.date().optional(),
            }),
            404:z.object({message: z.string()}),
            500:z.object({message: z.string()})
        }

    }
})