# Arquitetura

## Visão Geral

```text
[Browser] → Express (REST + static)
     ↓
     └→ Socket.io (real-time)
           ↓
       [SQLite] ← better-sqlite3
```

## Fluxo de autenticação
1. POST /api/auth/register → cria player, retorna JWT
2. JWT salvo em localStorage
3. Toda requisição inclui Authorization: Bearer <token>
4. Socket.io handshake inclui auth.token

## Fluxo de PvP
1. Player entra na fila via POST /api/match/queue
2. Fila em memória, ordenada por joinedAt
3. tryMatch() a cada 2s procura pares com rating similar
4. Quando acha, cria match e emite match:start para ambos
5. Após 20s, resolveMatch() calcula vencedor server-side
6. Aplica steal + rating delta + shield
7. Emite match:resolved para ambos

## Fluxo de blocos
1. GET /api/blocs lista todos
2. POST /api/blocs/:id/join adiciona player
3. Socket.io `b:{blocId}` é o canal do chat
4. recomputePower() atualiza poder do bloco periodicamente

## Anti-cheat
- Validação de taxa de GDP no /api/player/sync
- Se GDP enviado > maxReasonableGdp * 100 → rejeita e flag
- 3 flags → PvP bloqueado por 24h

## Persistência
- SQLite com WAL mode
- Prepared statements (zero SQL injection)
- Migrações aditivas (campos novos com default)
