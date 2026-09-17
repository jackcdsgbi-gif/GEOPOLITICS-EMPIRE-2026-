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

  io.on('connection', async (socket) => {
    if (socket.playerId) {
      socket.join(`p:${socket.playerId}`);
      try {
        await db.raw.query('UPDATE players SET last_seen = $1 WHERE id = $2', [Date.now(), socket.playerId]);
        logger.net(`Connect: ${socket.username} (${socket.id})`);
        const p = await models.Players.byId(socket.playerId);
        if (p?.bloc_id) {
          socket.join(`b:${p.bloc_id}`);
          io.to(`b:${p.bloc_id}`).emit('bloc:member-online', {
            playerId: p.id,
            username: p.username
          });
        }
      } catch (e) {
        logger.error('socket connect error', e);
      }
    }

    socket.on('bloc:chat', async ({ text }) => {
      if (!socket.playerId || !text || typeof text !== 'string') return;
      if (text.length > 300) return;
      try {
        const p = await models.Players.byId(socket.playerId);
        if (!p?.bloc_id) return;
        const msg = {
          from: p.username,
          nation: p.nation_name,
          emoji: p.nation_emoji || '🌐',
          text: text.trim(),
          ts: Date.now()
        };
        io.to(`b:${p.bloc_id}`).emit('bloc:chat', msg);
      } catch (e) {
        logger.error('socket bloc:chat error', e);
      }
    });

    socket.on('bloc:join-room', ({ blocId }) => {
      if (!socket.playerId) return;
      socket.join(`b:${blocId}`);
    });

    socket.on('bloc:leave-room', ({ blocId }) => {
      socket.leave(`b:${blocId}`);
    });

    socket.on('presence:ping', async () => {
      if (socket.playerId) {
        try {
          await db.raw.query('UPDATE players SET last_seen = $1 WHERE id = $2', [Date.now(), socket.playerId]);
        } catch (e) {}
      }
    });

    socket.on('disconnect', async () => {
      if (socket.playerId) {
        try {
          const p = await models.Players.byId(socket.playerId);
          if (p?.bloc_id) {
            io.to(`b:${p.bloc_id}`).emit('bloc:member-offline', {
              playerId: p.id,
              username: p.username
            });
          }
        } catch (e) {}
      }
      logger.net(`Disconnect: ${socket.username || 'anon'}`);
    });
  });

  // Broadcast de stats
  setInterval(async () => {
    try {
      const online = io.sockets.sockets.size;
      const playersOnline = await models.Players.online();
      io.emit('server:stats', { online, playersOnline, ts: Date.now() });
    } catch (e) {
      logger.error('stats broadcast error', e);
    }
  }, config.presenceBroadcastMs);

  // Roll de temporada
  setInterval(async () => {
    try {
      await db.season.rollIfDue();
    } catch (e) {
      logger.error('season roll', e);
    }
  }, config.seasonCheckMs);

  logger.ok('Socket.io handlers registrados');
}
