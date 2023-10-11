import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './Openapi';
import { createExpressEndpoints } from '@ts-rest/express';
import { contract } from './contracts';
import { router } from './routes';
import http from 'http';
//import { Server as WebSocketServer } from 'ws';

const app: Application = express();
const server = http.createServer(app);
// const wss = new WebSocketServer({ server }); 

app.use(cors());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

createExpressEndpoints(contract, router, app);

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