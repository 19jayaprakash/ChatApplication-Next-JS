"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const swaggerUi = __importStar(require("swagger-ui-express"));
const Openapi_1 = require("./Openapi");
const express_2 = require("@ts-rest/express");
const contracts_1 = require("./contracts");
const routes_1 = require("./routes");
const http_1 = __importDefault(require("http"));
//import { Server as WebSocketServer } from 'ws';
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// const wss = new WebSocketServer({ server }); 
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(Openapi_1.openApiDocument));
(0, express_2.createExpressEndpoints)(contracts_1.contract, routes_1.router, app);
const port = process.env.PORT || 3001;
server.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});
// wss.on('connection', (ws) => {
//   console.log('WebSocket connection established.');
//   ws.on('message', (message: string) => {
//     console.log('Received WebSocket message:', message);
//   });
//   ws.on('close', () => {
//     console.log('WebSocket connection closed.');
//   });
// });
