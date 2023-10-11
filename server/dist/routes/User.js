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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.singupRouter = exports.loginRouter = void 0;
const express_1 = require("@ts-rest/express");
const loginContract_1 = require("../contracts/loginContract");
const signupContract_1 = require("../contracts/signupContract");
const s = (0, express_1.initServer)();
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../middleware/auth");
exports.loginRouter = s.router(loginContract_1.loginContract, {
    login: ({ body }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = body;
            const user = yield prisma.user.findUnique({
                where: {
                    email: email,
                },
            });
            if (!user) {
                return {
                    status: 404,
                    body: "User not exist",
                };
            }
            const isMatch = yield bcryptjs_1.default.compare(password, user.password);
            if (!isMatch) {
                return {
                    status: 401,
                    body: "Invalid credentials"
                };
            }
            const payload = {
                user: {
                    id: user.id
                }
            };
            const token = jsonwebtoken_1.default.sign(payload, 'jwtSecret', { expiresIn: '5 days' });
            return {
                status: 200,
                body: { user, token }
            };
        }
        catch (err) {
            return {
                status: 500,
                body: "Login server error"
            };
        }
    }),
    getProfile: { middleware: [auth_1.checkAuth],
        handler: ({ req }) => __awaiter(void 0, void 0, void 0, function* () {
            let userId;
            const { user } = req.user;
            if (user && typeof user === 'object' && 'id' in user) {
                userId = user.id;
            }
            else {
                return {
                    status: 203,
                    body: "Login server error"
                };
            }
            const User = yield prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    profilePicture: true,
                    conversations: { select: { id: true, name: true } }
                }
            });
            if (!User) {
                return {
                    status: 404,
                    body: "User not found"
                };
            }
            return {
                status: 200,
                body: User
            };
        }) }
});
exports.singupRouter = s.router(signupContract_1.signupContract, {
    signup: ({ body }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { username, email, password } = body;
            const user = yield prisma.user.findUnique({
                where: {
                    email: email
                }
            });
            if (user) {
                return {
                    status: 201,
                    body: "user already exists"
                };
            }
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            const newUser = yield prisma.user.create({
                data: {
                    username: username,
                    email: email,
                    password: hashedPassword
                }
            });
            const payload = {
                user: {
                    id: newUser.id,
                }
            };
            const token = jsonwebtoken_1.default.sign(payload, "jwtSecret", { expiresIn: "5 days" });
            return {
                status: 200,
                body: { newUser, token }
            };
        }
        catch (err) {
            return {
                status: 500,
                body: "Signup server error"
            };
        }
    })
});
