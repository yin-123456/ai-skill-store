import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { queryOne } from '../db/connection.js';

export interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as any;
    const user = queryOne('SELECT id, username, role FROM users WHERE id = ?', [payload.sub]);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as any;
    const user = queryOne('SELECT id, username, role FROM users WHERE id = ?', [payload.sub]);
    if (user) req.user = user;
  } catch { /* ignore */ }
  next();
}
