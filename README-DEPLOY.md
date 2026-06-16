# Guía de Despliegue — teleprt (Cloudflare Pages + API)

## Arquitectura de producción

```
Usuario
  │
  ▼
Cloudflare Pages (Frontend Vite/React)
  │  https://teleprt.com  (custom domain)
  │  https://front-teleprt.pages.dev  (preview Pages)
  │
  ├─── API REST + HLS proxy ──────────────────────────────►
  │                                              https://api.teleprt.com
  │                                                    (VPS + Nginx + SSL)
  │
  └─── Admin UI (opcional) ───────────────────────────────►
                                              https://admin.teleprt.com
```

---

## 1. Frontend (`front/`)

### Cloudflare Pages

| Campo | Valor |
|-------|-------|
| **Root directory** | `front` |
| **Build command** | `npm run build` |
| **Build output directory** | `build` |
| **Node.js version** | `18` o superior |

### Variables de entorno (Production)

En **Settings → Environment Variables → Production**:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://api.teleprt.com` |
| `VITE_SITE_URL` | `https://teleprt.com` |
| `VITE_ENV` | `production` |

> El archivo `front/.env.production` ya contiene estos valores para builds locales.
> Las variables en Cloudflare Pages tienen prioridad.

### Dominio custom

1. Cloudflare Pages → Custom domains → `teleprt.com` y `www.teleprt.com`
2. Redirigir `www` → apex si lo prefieres

---

## 2. API principal (`server/`)

### Variables críticas en el VPS (`.env`)

Ver plantilla completa en `server/.env.example`.

```env
NODE_ENV=production
PORT=3000
SITE_URL=https://teleprt.com
COOKIE_DOMAIN=.teleprt.com
ALLOWED_ORIGINS=https://teleprt.com,https://www.teleprt.com,https://front-teleprt.pages.dev,https://admin.teleprt.com
```

### DNS

| Registro | Destino |
|----------|---------|
| `teleprt.com` | Cloudflare Pages (frontend) |
| `www.teleprt.com` | Cloudflare Pages |
| `api.teleprt.com` | IP del VPS (proxy Nginx → :3000) |
| `admin.teleprt.com` | Panel admin (opcional) |

### Nginx (ejemplo api.teleprt.com)

```nginx
server {
  listen 443 ssl http2;
  server_name api.teleprt.com;
  # certbot / Cloudflare origin cert...

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

---

## 3. Firebase (Google Sign-In)

1. [Firebase Console](https://console.firebase.google.com/) → proyecto `stream-inbeta-a37dd`
2. Authentication → Settings → **Authorized domains**
3. Agregar:
   - `teleprt.com`
   - `www.teleprt.com`
   - `front-teleprt.pages.dev`

---

## 4. Mixed Content (HTTPS → HTTP)

El frontend en Cloudflare usa **HTTPS**. La API **debe** estar en HTTPS (`https://api.teleprt.com`).
No uses `http://IP` en `VITE_API_URL` en producción.

---

## 5. Archivos de configuración incluidos

| Archivo | Propósito |
|---------|-----------|
| `front/.env.production` | Variables Vite para build |
| `front/public/_redirects` | SPA routing (Cloudflare Pages) |
| `front/public/_headers` | Headers de seguridad + cache |
| `front/functions/[[path]].js` | OG tags para crawlers |
| `front/wrangler.toml` | Nombre proyecto Pages: `teleprt-frontend` |
| `server/.env.example` | Plantilla API producción |

---

## 6. Checklist pre-lanzamiento

- [ ] `VITE_API_URL=https://api.teleprt.com` en Cloudflare Pages
- [ ] `VITE_SITE_URL=https://teleprt.com` en Cloudflare Pages
- [ ] `COOKIE_DOMAIN=.teleprt.com` en server `.env`
- [ ] `ALLOWED_ORIGINS` incluye teleprt.com + Pages preview
- [ ] SSL en `api.teleprt.com`
- [ ] Dominios Firebase autorizados
- [ ] `TELEPRT_PANEL_API_KEY` igual en API y panel admin
- [ ] B2 CORS actualizado (`npm run setup-b2-cors --prefix server`)
