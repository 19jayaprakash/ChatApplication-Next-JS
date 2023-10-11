"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginContract = void 0;
const core_1 = require("@ts-rest/core");
const zod_1 = require("zod");
const c = (0, core_1.initContract)();
const loginInput = zod_1.z.object({ email: zod_1.z.string(), password: zod_1.z.string() });
exports.loginContract = c.router({
    login: {
        method: "POST",
        path: "/login",
        body: loginInput,
        responses: {
            404: zod_1.z.string(),
            200: zod_1.z.object({
                user: zod_1.z.object({
                    id: zod_1.z.number(),
                    username: zod_1.z.string(),
                    email: zod_1.z.string(),
                    password: zod_1.z.string(),
                }), token: zod_1.z.string()
            }),
            500: zod_1.z.string()
        }
    },
    getProfile: {
        method: 'GET',
        path: '/profile',
        headers: zod_1.z.object({ 'x-auth-token': zod_1.z.string() }),
        responses: {
            404: zod_1.z.string(),
            200: zod_1.z.object({
                id: zod_1.z.number(),
                username: zod_1.z.string(),
                email: zod_1.z.string(),
                profilePicture: zod_1.z.string(),
                conversations: zod_1.z.array(zod_1.z.object({ name: zod_1.z.string(), id: zod_1.z.number() })),
            }),
        }
    }
});
