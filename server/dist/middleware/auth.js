"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function checkAuth(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        return {
            status: 401,
            body: 'Authentication failed. Token missing.'
        };
    }
    jsonwebtoken_1.default.verify(token, 'jwtSecret', (err, decoded) => {
        if (err) {
            return {
                status: 402,
                body: 'Authentication failed. Invalid token.'
            };
        }
        req.user = decoded;
        next();
    });
}
exports.checkAuth = checkAuth;
