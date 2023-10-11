import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

const conversationInput = z.object({
    name:z.string(),
    participants:z.array(z.number())
})

const deleteInput = z.object({userId:z.number()})

const addMemberInput = z.object({participantId:z.number(), conversationId:z.number()})

export const conversationContract = c.router({
    createConversation:{
        method:'POST',
        path:'/createConversation',
        headers: z.object({"x-auth-token":z.string()}),
        body:conversationInput,
        responses:{
            200: z.object({
                name:z.string(),
                participants:z.array(z.object({username:z.string()}))
                }),
            500: z.object({message:z.string()})
            }
        },
        getConversationById:{
            method:'GET',
            path:'/getConversation/:id',
            headers: z.object({'x-auth-token':z.string()}),
            responses:{
                200:z.object({
                    id:z.number(),
                    name:z.string(),
                    createdAt:z.date(),
                    updatedAt:z.date(),
                    participants:z.array(z.object({
                        id:z.number(),
                        username:z.string(),
                    })),
                    messages:z.array(z.object({
                        id:z.number(),
                        text:z.string(),
                        senderId:z.number(),
                        conversationId:z.number(),
                        createdAt:z.date()
                    })),
                }),
                404: z.object({message:z.string()}),
                500: z.object({message:z.string()})
            }
        },
        deleteConversationById:{
            method:'DELETE',
            path:'/deleteConversation/:id',
            headers: z.object({'x-auth-token':z.string()}),
            body:deleteInput,
            responses:{
                404: z.string(),
                405: z.string(),
                200: z.string(),
                500: z.string()
            }
        },
        addMembers:{
            method:'POST',
            path:'/addMembers',
            headers: z.object({'x-auth-token':z.string()}),
            body:addMemberInput,
            responses:{
                404: z.object({message:z.string()}),
                405: z.object({message:z.string()}),
                200: z.object({message:z.string()}),
                500: z.object({message:z.string()}),
            }
        }
    });