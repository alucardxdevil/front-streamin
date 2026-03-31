# 🔍 Estrategia SEO Completa — stream-in

## Índice

1. [Metadatos Dinámicos (react-helmet-async)](#1-metadatos-dinámicos)
2. [Open Graph & Twitter Cards](#2-open-graph--twitter-cards)
3. [Datos Estructurados JSON-LD](#3-datos-estructurados-json-ld)
4. [SEO para SPAs (Prerendering)](#4-seo-para-spas-prerendering)
5. [Optimización de Activos](#5-optimización-de-activos)
6. [Accesibilidad y Semántica](#6-accesibilidad-y-semántica)

---

## 1. Metadatos Dinámicos

### Instalación

```bash
cd front
npm install react-helmet-async
```

### Arquitectura

```
front/src/
├── index.js                          # HelmetProvider envuelve toda la app
├── App.js                            # SEOHead por defecto en todas las rutas
├── utils/
│   └── seoConfig.js                  # Configuración centralizada de SEO
├── components/seo/
│   ├── SEOHead.jsx                   # Componente base (title, description, canonical)
│   ├── SEOVideoWrapper.jsx           # SEO específico para páginas de video
│   └── SEOProfileWrapper.jsx         # SEO específico para perfiles de usuario
└── pages/
    ├── Video.jsx                     # Usa SEOVideoWrapper
    └── ProfileUser.jsx               # Usa SEOProfileWrapper
```

### Cómo funciona

- `HelmetProvider` en `index.js` habilita el contexto global.
- `SEOHead` en `App.js` establece metadatos por defecto.
- Cada página puede sobreescribir los metadatos usando `SEOVideoWrapper`, `SEOProfileWrapper` o `SEOHead` directamente.
- `react-helmet-async` usa la estrategia "last wins": el componente más profundo en el árbol gana.

---

## 2. Open Graph & Twitter Cards

### Páginas de Video

Al compartir `https://stream-in.com/video/abc123` en redes sociales:

- **og:title** → `"Mi Video Genial | stream-in"`
- **og:description** → Primeros 150 caracteres de la descripción
- **og:image** → Miniatura del video (`imgUrl`)
- **og:type** → `video.other`
- **og:video** → URL del HLS master playlist
- **twitter:card** → `summary_large_image`

### Páginas de Perfil

Al compartir `https://stream-in.com/profileUser/juan`:

- **og:type** → `profile`
- **og:image** → Foto de perfil del usuario
- **profile:username** → Slug del usuario

---

## 3. Datos Estructurados JSON-LD

### Esquema VideoObject

Cada página de video inyecta automáticamente un `<script type="application/ld+json">`:

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Título del Video",
  "description": "Descripción completa del video...",
  "thumbnailUrl": ["https://cdn.example.com/thumb.jpg"],
  "uploadDate": "2026-03-15T10:30:00.000Z",
  "contentUrl": "https://cdn.example.com/hls/abc123/master.m3u8",
  "embedUrl": "https://cdn.example.com/hls/abc123/master.m3u8",
  "url": "https://stream-in.com/video/abc123",
  "duration": "PT5M30S",
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": { "@type": "WatchAction" },
    "userInteractionCount": 1500
  },
  "author": {
    "@type": "Person",
    "name": "Juan Pérez",
    "url": "https://stream-in.com/profileUser/juan"
  },
  "publisher": {
    "@type": "Organization",
    "name": "stream-in",
    "logo": {
      "@type": "ImageObject",
      "url": "https://stream-in.com/logo-pest.jpg"
    }
  },
  "keywords": "gaming, tutorial, react"
}
```

### Validación

Usa la herramienta de Google para validar:
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

---

## 4. SEO para SPAs (Prerendering)

### Problema

Las SPAs de React renderizan contenido con JavaScript. Los crawlers de Google ejecutan JS, pero otros (Facebook, Twitter, LinkedIn) **no siempre lo hacen**.

### Solución Recomendada: `react-snap`

`react-snap` genera HTML estático durante el build para las rutas principales.

#### Instalación

```bash
cd front
npm install --save-dev react-snap
```

#### Configuración en `package.json`

```json
{
  "scripts": {
    "postbuild": "react-snap"
  },
  "reactSnap": {
    "include": [
      "/",
      "/trends",
      "/us",
      "/help",
      "/terms",
      "/contact",
      "/support"
    ],
    "skipThirdPartyRequests": true,
    "headless": true,
    "puppeteerArgs": ["--no-sandbox", "--disable-setuid-sandbox"],
    "minifyHtml": {
      "collapseWhitespace": true,
      "removeComments": true
    }
  }
}
```

#### Modificar `index.js` para hidratación

```jsx
const rootElement = document.getElementById('root');

if (rootElement.hasChildNodes()) {
  // Si react-snap ya pre-renderizó, hidratar
  ReactDOM.hydrateRoot(rootElement,
    <React.StrictMode>
      <HelmetProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </HelmetProvider>
    </React.StrictMode>
  );
} else {
  // Render normal en desarrollo
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </HelmetProvider>
    </React.StrictMode>
  );
}
```

### Alternativa: Prerender.io (servicio externo)

Si `react-snap` no es viable, puedes usar [Prerender.io](https://prerender.io/) como middleware en el servidor:

```bash
npm install prerender-node
```

```js
// server/index.js
import prerender from 'prerender-node';
app.use(prerender.set('prerenderToken', 'YOUR_TOKEN'));
```

---

## 5. Optimización de Activos

### 5.1 Conversión de Miniaturas a WebP

#### Flujo propuesto

1. **Al subir un video**, el usuario sube una miniatura (JPG/PNG).
2. **En el worker de transcodificación** (`server/workers/transcodeWorker.js`), después de transcodificar el video:
   - Descargar la miniatura original de B2.
   - Convertir a WebP usando `sharp`.
   - Subir la versión WebP a B2 con key: `thumbnails/{userId}/{uuid}.webp`.
   - Actualizar el campo `imgUrl` del video con la URL WebP.
   - Opcionalmente, mantener la original como fallback.

#### Implementación con `sharp`

```bash
cd server
npm install sharp
```

```js
// server/utils/convertToWebP.js
import sharp from 'sharp';

/**
 * Convierte un buffer de imagen a formato WebP.
 * @param {Buffer} inputBuffer — Buffer de la imagen original.
 * @param {number} quality     — Calidad WebP (1-100, default 80).
 * @returns {Promise<Buffer>}  — Buffer de la imagen en WebP.
 */
export const convertToWebP = async (inputBuffer, quality = 80) => {
  return sharp(inputBuffer)
    .webp({ quality })
    .resize(1280, 720, { fit: 'cover', withoutEnlargement: true })
    .toBuffer();
};
```

#### En el frontend: `<picture>` con fallback

```jsx
<picture>
  <source srcSet={video.imgUrlWebP} type="image/webp" />
  <img src={video.imgUrl} alt={video.title} loading="lazy" />
</picture>
```

### 5.2 Sitemap Dinámico

El endpoint `GET /sitemap.xml` ya está implementado en `server/routes/sitemap.js`.

Incluye:
- Rutas estáticas (`/`, `/trends`, `/us`, etc.)
- URLs de todos los videos con status `ready` (con extensión `<video:video>`)
- URLs de todos los perfiles de usuario

El `robots.txt` en `front/public/robots.txt` ya apunta al sitemap.

---

## 6. Accesibilidad y Semántica

### Componentes que deben usar etiquetas semánticas

| Componente actual | Cambio sugerido |
|---|---|
| `ContainerO` (Video.jsx) | `styled.main` → `<main>` |
| `Content` (Video.jsx) | `styled.article` → `<article>` |
| `DescriptionCard` (Video.jsx) | `styled.section` → `<section>` |
| `InfoGrid` (Video.jsx) | `styled.section` → `<section>` |
| `Container` (ProfileUser.jsx) | `styled.main` → `<main>` |
| `Navbar` | Ya usa `<nav>` ✓ |
| `Card` (Card.jsx) | `styled.article` → `<article>` |
| `Comments` | `styled.section` → `<section>` |

### Ejemplo de migración

**Antes:**
```jsx
const ContainerO = styled.div`
  display: grid;
  ...
`;
```

**Después:**
```jsx
const ContainerO = styled.main`
  display: grid;
  ...
`;
```

### Atributos de accesibilidad recomendados

- Todas las `<img>` deben tener `alt` descriptivo ✓ (ya implementado en Avatar)
- Los botones de acción deben tener `aria-label`
- Los modales deben tener `role="dialog"` y `aria-modal="true"`
- Los videos deben tener `aria-label` con el título

---

## Variables de Entorno Necesarias

### Frontend (`front/.env.production`)

```env
REACT_APP_SITE_URL=https://stream-in.com
REACT_APP_API_URL=https://api.stream-in.com
```

### Servidor (`.env`)

```env
SITE_URL=https://stream-in.com
```

---

## Checklist de Implementación

- [x] `react-helmet-async` agregado a `package.json`
- [x] `HelmetProvider` configurado en `index.js`
- [x] `SEOHead` componente base creado
- [x] `SEOVideoWrapper` con OG, Twitter Cards y JSON-LD
- [x] `SEOProfileWrapper` con OG, Twitter Cards y JSON-LD
- [x] Integración en `Video.jsx`
- [x] Integración en `ProfileUser.jsx`
- [x] `SEOHead` por defecto en `App.js`
- [x] `index.html` actualizado con meta tags base
- [x] `robots.txt` creado
- [x] Endpoint `/sitemap.xml` dinámico en servidor
- [x] Ruta registrada en `server/index.js`
- [ ] Ejecutar `npm install` en `front/` para instalar `react-helmet-async`
- [ ] (Opcional) Instalar `react-snap` para prerenderizado
- [ ] (Opcional) Instalar `sharp` en servidor para conversión WebP
- [ ] Agregar `REACT_APP_SITE_URL` a `.env.production`
- [ ] Agregar `SITE_URL` al `.env` del servidor
- [ ] Validar JSON-LD en Google Rich Results Test
- [ ] Migrar styled.div → styled.main/article/section en componentes clave
