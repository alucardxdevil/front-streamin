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

1. **CORS**: El backend debe tener el dominio de Cloudflare Pages en `ALLOWED_ORIGINS`
2. **HTTPS**: Si el backend no tiene SSL, los navegadores pueden bloquear peticiones HTTP desde HTTPS. Considera usar un proxy Nginx con SSL en el servidor.
3. **Cookies**: Las cookies de sesión requieren `SameSite=None; Secure` si el frontend es HTTPS y el backend es HTTP.
