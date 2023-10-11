import { initServer } from "@ts-rest/express";
import { PrismaClient } from '@prisma/client';

const s = initServer();

const prisma = new PrismaClient();

import { conversationContract } from '../contracts/conversationContract';
import { checkAuth } from '../middleware/auth';
import { JwtPayload } from "jsonwebtoken";


export const conversationRouter = s.router(conversationContract, {
  createConversation: {
    middleware: [checkAuth],
    handler: async ({ req }) => {
      try {
        const { name, participants } = req.body;
        const conversation = await prisma.conversation.create({
          data: {
            name,
            participants: {
              connect: participants.map((participant: number) => ({
                id: participant})),
            }
          },
          include: {
            participants: true,
          }
        })
        const userConversation = await prisma.userConversation.createMany({
          data:
            participants.map((participant: number) => ({
              userId: participant,
              conversationId: conversation.id,
            })),
        })
        console.log(userConversation);
        return {
          status: 200,
          body: conversation
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
        return {
          status: 500,
          body:{message:"Error creating conversation"}
        }
      }
    }
  }
  ,
  getConversationById: {
    middleware: [checkAuth], handler: async ({ params,req }) => {
      try {

        const { user } = req.user as JwtPayload;
        let userId:string;
        if (user && typeof user === 'object' && 'id' in user) {
              userId= user.id;
            }
        const conversationId = params.id;
        const conversation = await prisma.conversation.findUnique({
          where: { id: parseInt(conversationId.toString()) },
          include: {
            messages: true,
            participants: true
          }
        });
        if (!conversation) {
          return {
            status: 404,
            body:{message:'Conversation not found'}
          }
        } 

        const isParticipant = conversation.participants.some((participant: any) => participant.id === userId);

        if(!isParticipant) {
          return{
            status:204,
            body:"you are not a participant"
          }
        }
          return {
            status: 200,
            body: conversation
          }
        
      } catch (error) {
        console.error('Error fetching conversation:', error);
        return {
          status: 500,
          body: {message:'Internal Server Error'}
        }
      }
    }
  },
  deleteConversationById: {
    middleware: [checkAuth], handler: async ({ req, body }) => {
      try {
        const conversationId = req.params.id;
        const userId = body;

        const conversation = await prisma.conversation.findUnique({
          where: { id: parseInt(conversationId) },
          include: {
            participants: true
          }
        });

        if (!conversation) {
          return {
            status: 404,
            body:'Conversation not found'
          }
        }

        const isParticipant = await prisma.userConversation.findFirst({
          where: {
            userId: userId.userId,
            conversationId: parseInt(conversationId)
          }
        });

        if (!isParticipant) {
          return {
            status: 405,
            body: 'You are not authorized to delete this conversation'
          }
        }

        await prisma.userConversation.delete({
          where: {
            id: isParticipant.id
          }
        })

        await prisma.user.update({
          where: {
            id: userId.userId,
          },
          data: {
            conversations: {
              disconnect:{
                id:parseInt(conversationId),
              }
            }
          }
        })
        return {
          status: 200,
          body:'Conversation deleted successfully'
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
        return {
          status: 500,
          body:'Internal Server Error'
        }
      }
    }
  },
  addMembers: {
    middleware: [checkAuth], handler: async ({ body,req }) => {
      try {

        const { participantId, conversationId } = body;

        const { user } = req.user as JwtPayload;
        let userId: string ;

      if (user && typeof user === 'object' && 'id' in user) {
          userId= user.id;
      }

        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },include:{participants:true}
        });

        if (!conversation) {
          return {
            status: 404,
            body:{message:'Conversation not found'}
          }
        }
        const isParticipant = conversation.participants.some((participant: any) => participant.id === userId);
        
        if (!isParticipant) {
          return {
            status: 405,
            body:{message:'you are not a participant of this conversation'}
          }
        }

        const existingUserConversation = await prisma.userConversation.findFirst({
          where: {
            userId:participantId,
            conversationId,
          },
        });

        if (existingUserConversation) {
          return {
            status: 202,
            body:{message:'User is already a member of this conversation'}
          }
        }

         await prisma.userConversation.create({
          data: {
            userId:participantId,
            conversationId,
          },
        });

        return {
          status: 200,
          body:{message:'User added to the conversation'}
        }
      } catch (error) {
        console.error('Error adding member to conversation:', error);
        return {
          status: 500,
          body:{message:'Internal Server Error'}
        }
      }
    }
  }

}); 