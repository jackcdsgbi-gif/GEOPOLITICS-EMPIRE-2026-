# Dollar Doctrine — Multiplayer Server

Servidor Node.js completo para transformar o jogo single-player Dollar Doctrine em um ecossistema multiplayer competitivo com ranking, blocos de aliança, PvP e chat em tempo real.

## Como rodar

```bash
cd "C:\Users\Gustavo IA 26\OneDrive\Desktop\SERVER TEST"
npm install
copy .env.example .env
npm start
```

Abra: [http://localhost:4000](http://localhost:4000/)

## Como expor à internet

```bash
# Opção 1 — LocalTunnel (mais rápido, sem signup)
npx localtunnel --port 4000

# Opção 2 — Cloudflare Tunnel (mais estável)
cloudflared tunnel --url http://localhost:4000
```

## Estrutura

- `server.js` — Express + Socket.io + static
- `src/` — Backend (config, db, auth, models, matchmaking, routes, sockets)
- `public/` — Hub multiplayer (frontend web)
- `game/` — Jogo original (single-player)
- `data/` — Banco SQLite (gerado automaticamente)

## Sistemas

- **Auth**: JWT + bcrypt
- **Ranking**: ELO (base 1000) + PIB Peak
- **Blocos**: 6 pré-definidos + custom
- **PvP**: matchmaking + raid + escudo 2h
- **Temporadas**: 90 dias
- **Chat**: Socket.io em tempo real
- **Anti-cheat**: validação de taxa de GDP
