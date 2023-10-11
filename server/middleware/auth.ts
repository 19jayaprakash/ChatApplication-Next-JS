import { Request, Response, NextFunction } from 'express';
import jwt,{JwtPayload} from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string;
    }
  }
}

export function checkAuth(req: Request , res: Response, next: NextFunction) {
  const token = req.header('x-auth-token');

  if (!token) {
    return {
        status: 401,
        body:'Authentication failed. Token missing.'
    }
  }

    jwt.verify(token,'jwtSecret',(err, decoded) => {
      if (err) {
        return {
          status: 402,
          body:'Authentication failed. Invalid token.'
        }
      } 
    req.user = decoded;
    next();
  });
}
