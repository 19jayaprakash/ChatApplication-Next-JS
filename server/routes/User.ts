import { initServer } from "@ts-rest/express"
import { loginContract } from "../contracts/loginContract"
import { signupContract } from "../contracts/signupContract";

const s = initServer();

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { checkAuth } from "../middleware/auth";

export const loginRouter = s.router(loginContract, {
    login: async ({ body }) => {

        try {
            const { email, password } = body;

            const user = await prisma.user.findUnique({
                where: {
                    email: email,
                },
            })
            if (!user) {
                return {
                    status: 404,
                    body: "User not exist",
                }
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return {
                    status: 401,
                    body: "Invalid credentials"
                }
            }
            const payload = {
                user: {
                    id: user.id
                }
            };
            const token = jwt.sign(payload, 'jwtSecret', { expiresIn: '5 days' });
            return {
                status: 200,
                body: { user, token }
            }

        } catch (err) {
            return {
                status: 500,
                body: "Login server error"
            }
        }
    },
    getProfile:{middleware:[checkAuth],
        handler: async({req})=>{
        let userId:number;
        
        const { user } = req.user as JwtPayload;

        if (user && typeof user === 'object' && 'id' in user) {
                userId= user.id;
            }
        else{
            return{
                status:203,
                body: "Login server error"
            }
        }

        const User = await prisma.user.findUnique({
            where:{id:userId},
            select:{
                id:true,
                username:true,
                email:true,
                profilePicture:true,
                conversations:{select:{id:true,name:true}}
            }
        });

        if(!User){
            return{
                status:404,
                body:"User not found"
            }
        }
        
        return{
            status:200,
            body:User
        }
    }}
});

export const singupRouter = s.router(signupContract, {
    signup: async ({ body }) => {
        try {
            const { username, email, password } = body;

            const user = await prisma.user.findUnique({
                where: {
                    email
                }
            })

            if (user) {
                return {
                    status: 201,
                    body: "user already exists"
                }
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await prisma.user.create({
                data: {
                    username: username,
                    email: email,
                    password: hashedPassword
                }
            });

            const payload = {
                user:{
                    id: newUser.id,
                }
            };

            const token = jwt.sign(payload,"jwtSecret",{expiresIn:"5 days"});


            return {
                status: 200,
                body: {newUser, token}
            }

        }
        catch (err) {
            console.log("errr...",err);
            
            return {
                status: 500,
                body: "Signup server error"
            }
        }
    }

})


