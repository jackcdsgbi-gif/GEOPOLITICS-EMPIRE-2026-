import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './src/config.js';
import { logger } from './src/logger.js';
import { initDb } from './src/db.js';
import { registerRoutes } from './src/routes.js';
import { setupSockets } from './src/sockets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: { origin: '*', credentials: false },
  pingInterval: 10000,
  pingTimeout: 20000,
  maxHttpBufferSize: 1e6
});

app.set('io', io);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/game', express.static(path.join(__dirname, 'game')));

app.use(
  '/api',
  rateLimit({
    windowMs: 60_000,
    max: 240,
    standardHeaders: true,
    legacyHeaders: false
  })
);

const db = initDb();
registerRoutes(app, db);
setupSockets(io, db);

app.get('/api/health', (_req, res) =>
  res.json({
    ok: true,
    ts: Date.now(),
    season: db.season.current(),
    uptime: process.uptime()
  })
);

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
  if (req.path.startsWith('/game')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(config.port, '0.0.0.0', () => {
  logger.info('═══════════════════════════════════════════════════════');
  logger.info(` DOLLAR DOCTRINE MULTIPLAYER rodando em todas as interfaces`);
  logger.info(` Local (PC):        http://localhost:${config.port}/game/`);
  logger.info(` Celular (Mesmo WiFi): http://192.168.101.3:${config.port}/game/`);
  logger.info(` Servidor Preview:   http://192.168.101.3:3777`);
  logger.info('═══════════════════════════════════════════════════════');
  logger.info(' Para expor à internet (fora do WiFi):');
  logger.info(` npx localtunnel --port ${config.port}`);
  logger.info(` OU: cloudflared tunnel --url http://localhost:${config.port}`);
  logger.info('═══════════════════════════════════════════════════════');
});

process.on('SIGINT', () => {
  logger.info('Encerrando...');
  server.close(() => process.exit(0));
});
