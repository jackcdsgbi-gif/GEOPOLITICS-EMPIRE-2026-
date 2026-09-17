import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from './config.js';

export function hashPassword(pw) {
  return bcrypt.hashSync(pw, 10);
}

export function verifyPassword(pw, hash) {
  return bcrypt.compareSync(pw, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '30d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'no_token' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'invalid_token' });
  req.playerId = payload.pid;
  req.username = payload.username;
  req.userRole = payload.role || 'player';
  next();
}

export function isAdmin(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      error: 'forbidden',
      message: 'Acesso restrito para administradores.'
    });
  }
  next();
}
