import { initServer } from "@ts-rest/express";
import { PrismaClient } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import { messageContract } from '../contracts/messageContract';
import { checkAuth } from '../middleware/auth';

const prisma = new PrismaClient();
const s = initServer();

export const messageRouter = s.router(messageContract, {
  addMessage: {
    middleware: [checkAuth],
    handler: async ({ req, body }) => {
      try {
        const { text, conversationId } = body;
        const userId = getUserIdFromRequest(req);

        const conversation = await findConversation(conversationId.toString());

        console.log(conversation,'conversation');
        

        if (!conversation) {
          return {
            status: 404,
            body: { message: "Conversation not found" }
          };
        }

        if (!isUserParticipant(userId, conversation)) {
          return {
            status: 403,
            body: { message: "You are not a participant in this conversation" }
          };
        }

        if (text && conversationId) {
          const newMessage = await createMessage(text, userId, conversationId);

          return {
            status: 200,
            body: newMessage,
          };
        }

        return {
          status: 400,
          body: { message: "From, to, and Message are required." },
        };
      } catch (err) {
        return {
          status: 500,
          body: { message: "Message internal server error" },
        };
      }
    },
  },
  getMessage: {
    middleware: [checkAuth],
    handler: async ({ req, query }) => {
      try {
        const conversationId = req.params.id;
        const userId = getUserIdFromRequest(req);
        const { lastFetched } = query;
  
        const currentTime = new Date();
  
        const conversation = await findConversation(conversationId);
        if (!conversation) {
          return {
            status: 404,
            body: { message: "Conversation not found" },
          };
        }
  
        if (!isUserParticipant(userId, conversation)) {
          return {
            status: 403,
            body: { message: "You are not a participant in this conversation" },
          };
        }
  
        let messages = [];
        let updatedLastFetched;
  
        if (lastFetched) {
          const lastFetchedTime = new Date(lastFetched);
          messages = await findMessagesByTimeRange(conversation.id, lastFetchedTime, currentTime);
          updatedLastFetched = currentTime;
        } else {
          messages = await findMessages(conversation.id);
          updatedLastFetched= currentTime;
        }
        return {
          status: 200,
          body: { messages: messages,lastFetched: updatedLastFetched},
        };
      } catch (err) {
        console.error(err);
        return {
          status: 500,
          body: { message: "Message internal server error" },
        };
      }
    },
  }
});

function getUserIdFromRequest(req: any): number {
  const { user } = req.user as JwtPayload;

  if (user && typeof user === 'object' && 'id' in user) {
    return user.id;
  }

  console.log("Invalid user");
  throw new Error("Invalid user");
}

async function findConversation(conversationId: string): Promise<any | null> {
  return await prisma.conversation.findUnique({
    where: { id: parseInt(conversationId) },
    include: { participants: true },
  });
}

function isUserParticipant(userId: number, conversation: any): boolean {
  return conversation.participants.some((participant: any) => participant.id === userId);
}

async function createMessage(text: string, userId: number, conversationId: number): Promise<any> {
  return await prisma.message.create({
    data: {
      text,
      senderId: userId,
      conversationId,
    },
  });
}

async function findMessages(conversationId: number): Promise<any[]> {
  return await prisma.message.findMany({
    where: { conversationId: conversationId },
    select: { id: true, text: true, senderId: true },
  });
}

async function waitForNewMessages(conversationId: number, currentMessages: any[]): Promise<any[]> {
  const timeoutMs = 1000;
  const startTime = Date.now();

  while (true) {
    const newMessages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
        createdAt: { gte: new Date(startTime) },
      },
      select: { id: true, text: true, senderId: true },
    });

    if (newMessages.length > 0) {
      currentMessages = [...currentMessages, ...newMessages];
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, timeoutMs));
  }

  return currentMessages;
}

async function findMessagesByTimeRange(conversationId:number, startTime:Date, endTime:Date) {
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
        createdAt: {
          gte: startTime,
          lte: endTime,
        },
      },
      select: {
        id: true,
        text: true,
        senderId: true,
      },
    });

    return messages;
  }