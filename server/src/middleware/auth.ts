import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userEmail?: string;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const auth = req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = auth.slice(7);
  const secret = process.env.JWT_SECRET || 'dev-secret';
  try {
    const decoded = jwt.verify(token, secret) as { sub?: string };
    if (!decoded.sub) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userEmail = decoded.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
