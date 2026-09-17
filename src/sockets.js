import { verifyToken } from './auth.js';
import { createModels } from './models.js';
import { config } from './config.js';
import { logger } from './logger.js';

export function setupSockets(io, db) {
  const models = createModels(db);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        socket.playerId = payload.pid;
        socket.username = payload.username;
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    if (socket.playerId) {
      socket.join(`p:${socket.playerId}`);
      db.raw.prepare('UPDATE players SET last_seen = ? WHERE id = ?').run(Date.now(), socket.playerId);
      logger.net(`Connect: ${socket.username} (${socket.id})`);
      const p = models.Players.byId(socket.playerId);
      if (p?.bloc_id) {
        socket.join(`b:${p.bloc_id}`);
        io.to(`b:${p.bloc_id}`).emit('bloc:member-online', {
          playerId: p.id,
          username: p.username
        });
      }
    }

    socket.on('bloc:chat', ({ text }) => {
      if (!socket.playerId || !text || typeof text !== 'string') return;
      if (text.length > 300) return;
      const p = models.Players.byId(socket.playerId);
      if (!p?.bloc_id) return;
      const msg = {
        from: p.username,
        nation: p.nation_name,
        emoji: p.nation_emoji || '🌐',
        text: text.trim(),
        ts: Date.now()
      };
      io.to(`b:${p.bloc_id}`).emit('bloc:chat', msg);
    });

    socket.on('bloc:join-room', ({ blocId }) => {
      if (!socket.playerId) return;
      socket.join(`b:${blocId}`);
    });

    socket.on('bloc:leave-room', ({ blocId }) => {
      socket.leave(`b:${blocId}`);
    });

    socket.on('presence:ping', () => {
      if (socket.playerId) {
        db.raw.prepare('UPDATE players SET last_seen = ? WHERE id = ?').run(Date.now(), socket.playerId);
      }
    });

    socket.on('disconnect', () => {
      if (socket.playerId) {
        const p = models.Players.byId(socket.playerId);
        if (p?.bloc_id) {
          io.to(`b:${p.bloc_id}`).emit('bloc:member-offline', {
            playerId: p.id,
            username: p.username
          });
        }
      }
      logger.net(`Disconnect: ${socket.username || 'anon'}`);
    });
  });

  // Broadcast de stats
  setInterval(() => {
    const online = io.sockets.sockets.size;
    const playersOnline = models.Players.online();
    io.emit('server:stats', { online, playersOnline, ts: Date.now() });
  }, config.presenceBroadcastMs);

  // Roll de temporada
  setInterval(() => {
    try {
      db.season.rollIfDue();
    } catch (e) {
      logger.error('season roll', e);
    }
  }, config.seasonCheckMs);

  logger.ok('Socket.io handlers registrados');
}
