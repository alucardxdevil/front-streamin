# Guía de Despliegue — Cloudflare Pages

## Configuración en Cloudflare Pages

### 1. Conectar el repositorio

1. Ve a [Cloudflare Pages](https://pages.cloudflare.com/)
2. Crea un nuevo proyecto → **Connect to Git**
3. Selecciona el repositorio de GitHub
4. Configura el **Root directory** como `front`

### 2. Configuración del Build

| Campo | Valor |
|-------|-------|
| **Framework preset** | Create React App |
| **Build command** | `npm run build` |
| **Build output directory** | `build` |
| **Root directory** | `front` |
| **Node.js version** | `18` (o superior) |

> **IMPORTANTE:** El proyecto usa **npm** (no yarn). El archivo `yarn.lock` fue eliminado para evitar conflictos con Yarn 4 en Cloudflare Pages. Cloudflare Pages detectará el `package-lock.json` y usará npm automáticamente.
>
> **NO usar** `npx wrangler deploy` — ese comando es para Cloudflare Workers, no para Pages. Cloudflare Pages hace el deploy automáticamente al hacer push al repositorio.

### 3. Variables de Entorno (Production)

En **Settings → Environment Variables → Production**, agrega:

| Variable | Valor |
|----------|-------|
| `REACT_APP_API_URL` | `http://89.167.94.4` |
| `REACT_APP_ENV` | `production` |

> **Nota:** El archivo `.env.production` ya incluye estas variables y se sube al repositorio.
> Las variables de Cloudflare Pages tienen prioridad sobre el archivo `.env.production`.

### 4. Configuración del Backend (servidor en 89.167.94.4)

En el archivo `.env` del servidor, asegúrate de incluir el dominio de Cloudflare Pages en `ALLOWED_ORIGINS`:

```env
ALLOWED_ORIGINS=https://stream-in.pages.dev,https://tu-dominio-personalizado.com
NODE_ENV=production
```

---

## Arquitectura de Producción

```
Usuario
  │
  ▼
Cloudflare Pages (Frontend React)
  │  https://stream-in.pages.dev
  │
  ├─── Llamadas API ──────────────────────────────────────────────────────────►
  │                                                                    Backend
  │                                                              http://89.167.94.4
  │                                                                    │
  │                                                                    ├── /api/auth
  │                                                                    ├── /api/users
  │                                                                    ├── /api/videos
  │                                                                    ├── /api/comments
  │                                                                    ├── /api/upload
  │                                                                    ├── /api/transcode
  │                                                                    └── /api/stream (proxy HLS)
  │
  └─── Assets estáticos ──────────────────────────────────────────────────────►
                                                                  Cloudflare CDN
```

## Archivos de Configuración Incluidos

| Archivo | Propósito |
|---------|-----------|
| `front/.env.production` | Variables de entorno para producción |
| `front/public/_redirects` | Enrutamiento SPA (evita 404 al recargar) |
| `front/public/_headers` | Headers de seguridad HTTP |
| `front/wrangler.toml` | Configuración de Cloudflare Pages |
| `front/src/utils/axiosConfig.js` | Configuración global de axios con baseURL |

## Flujo de Llamadas API

En producción, todas las llamadas axios usan:
- **baseURL**: `http://89.167.94.4/api`
- Las rutas relativas como `/videos/random` se resuelven como `http://89.167.94.4/api/videos/random`

En desarrollo, el proxy de CRA redirige:
- `/api/*` → `http://localhost:5000/api/*`

## Notas Importantes

### ⚠️ CRÍTICO: Mixed Content (HTTPS → HTTP)

El frontend en Cloudflare Pages usa **HTTPS**. Si el backend (`89.167.94.4`) usa **HTTP**, los navegadores bloquearán todas las peticiones con el error:
```
Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint 'http://89.167.94.4/api/...'
```

**Soluciones (elige una):**

**Opción A — Cloudflare Tunnel (recomendada, gratis):**
1. Instala `cloudflared` en el servidor: `curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared`
2. Autentica: `cloudflared tunnel login`
3. Crea un tunnel: `cloudflared tunnel create stream-in-backend`
4. Configura el tunnel para exponer el puerto 5000 con un subdominio HTTPS
5. Actualiza `REACT_APP_API_URL` en `.env.production` con la URL HTTPS del tunnel

**Opción B — Nginx + Let's Encrypt:**
```bash
# En el servidor 89.167.94.4
apt install nginx certbot python3-certbot-nginx
certbot --nginx -d api.tudominio.com
# Configura Nginx como reverse proxy al puerto 5000
```
Luego actualiza `REACT_APP_API_URL=https://api.tudominio.com`

**Opción C — Certificado SSL directo en Node.js:**
Configura HTTPS directamente en el servidor Express con un certificado SSL.

---

### ⚠️ Firebase OAuth: Dominio no autorizado

Si usas Google Sign-In con Firebase, debes agregar el dominio de Cloudflare Pages a los dominios autorizados:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona el proyecto `stream-inbeta-a37dd`
3. Authentication → Settings → **Authorized domains**
4. Agrega: `front-streamin.pages.dev` (y el subdominio específico si es necesario)

---

### CORS en el backend

El backend debe tener el dominio de Cloudflare Pages en `ALLOWED_ORIGINS`:
```env
ALLOWED_ORIGINS=https://front-streamin.pages.dev,https://a9e4016b.front-streamin.pages.dev
```
