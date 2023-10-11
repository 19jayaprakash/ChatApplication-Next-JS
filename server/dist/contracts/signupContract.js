"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupContract = void 0;
const core_1 = require("@ts-rest/core");
const zod_1 = require("zod");
const c = (0, core_1.initContract)();
const signupInput = zod_1.z.object({ username: zod_1.z.string(), email: zod_1.z.string(), password: zod_1.z.string() });
exports.signupContract = c.router({
    signup: {
        method: "POST",
        path: "/signup",
        body: signupInput,
        responses: {
            201: zod_1.z.string(),
            200: zod_1.z.object({ newUser: zod_1.z.object({
                    id: zod_1.z.number(),
                    username: zod_1.z.string(),
                    email: zod_1.z.string(),
                    password: zod_1.z.string(),
                }), token: zod_1.z.string()
            }),
            500: zod_1.z.string()
        }
    },
});
