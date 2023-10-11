import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

const signupInput = z.object({username:z.string(),email:z.string(), password:z.string()});

export const signupContract =c.router({
    signup:{
        method: "POST",
        path: "/signup",
        body: signupInput,
        responses:{
            201: z.string(),
            200: z.object({newUser:z.object({
                id:z.number(),
                username:z.string(),
                email:z.string(),
                password:z.string(),}),token:z.string()
            }),
            500: z.string()
        }
    },
})