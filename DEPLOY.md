# Deploy — Como expor à internet

## Opção 1: LocalTunnel (30 segundos)

```bash
npm start
npx localtunnel --port 4000
```
Ele te dá uma URL https://xxx.loca.lt. Envie para seus jogadores.

## Opção 2: Cloudflare Tunnel (recomendado, grátis)

Baixe cloudflared: [https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)

Execute:
```bash
cloudflared tunnel --url http://localhost:4000
```
Copie a URL https://xyz.trycloudflare.com

## Opção 3: VPS real

1. Alugue um VPS (Hetzner CX22 €4/mês, DigitalOcean $6/mês)
2. Instale Node.js 20+
3. git clone ou copie a pasta
4. npm install && npm start
5. Use pm2: pm2 start server.js --name dd && pm2 save
6. Aponte o DNS do seu domínio para o IP do VPS
7. Use Caddy para HTTPS automático

## Opção 4: Railway / Render / Fly.io

Deploy direto do GitHub. HTTPS grátis. Escala automática.

## Domínio próprio

Compre em Namecheap ou Porkbun, aponte para Cloudflare Tunnel, HTTPS automático em 5 minutos.
