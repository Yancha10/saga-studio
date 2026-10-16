# Notas para cualquier IA que trabaje en Saga Studio

Léelo antes de tocar nada. Dani habla español de España (coloquial) y quiere respuestas cortas.

## Qué es
App personal (PWA) para crear imágenes, vídeos y audios de Saga Lai. **Un solo archivo: `index.html`** (HTML + CSS + JS vanilla, sin build ni frameworks). Se publica con GitHub Pages desde `main`: https://yancha10.github.io/saga-studio/

## Reglas que no se pueden saltar
1. **Cada cambio en `index.html` o en archivos que cachea el service worker obliga a subir la versión de `C` en `sw.js`** (ahora `saga-v37` → `saga-v38`…). Si no, la app sigue enseñando la versión vieja.
2. Tras tocar `index.html`, comprobar la sintaxis: sacar el contenido de cada `<script>` a un archivo y pasar `node --check`.
3. Los datos de Dani NO están en el repositorio: viven en `localStorage` + IndexedDB del navegador y se sincronizan con su Google Drive. No pidas ni guardes claves de API en el código.
4. La app está tras un login de Google. No se puede probar entera sin sesión; para CSS suelto, montar una página de prueba con el mismo marcado.
5. Textos de la interfaz en español de España. Nada de botones con palabras partidas a mitad (se envuelve solo entre palabras).

## Estructura
- `index.html` — toda la app. Piezas clave: `ADAPTERS` (wiro, fal, pollo, higgsfield), `PROV_UI`, `thumbPrompt(lib, it)` (prompts de miniaturas), `NEUTRAL_BG` (fondo gris #D3D3D3), `seedCatalog()` (siembra de fichas y migraciones con banderas `peinImgV`, `catalogV`…), `renderLib` (galerías), `src(ref)` (resuelve imágenes: `m:...` = IndexedDB, si no, URL relativa).
- Al final de `index.html` hay scripts sueltos: separador de columnas (columna central redimensionable) y **vestidor «vista limpia»** (`cut()` recorta cada lámina de Notion a la prenda de cuerpo entero: busca la costura entre prenda y detalles y corta antes de líneas blancas).
- `sw.js` — service worker (red primero, copia guardada si falla).
- `catalog/*.v1.json` — modelos por proveedor (Pollo, fal, Higgsfield) y `families.v1.json`.
- `img/peinados/<id>.jpg` — fotos de los 90 peinados; se asignan a su ficha una sola vez por migración (`peinImgV`).
- `expresiones/` y `vestidor/` — imágenes de esas fichas.
- `worker/` — puentes de Cloudflare Workers (`wiro-worker.js`, `higgsfield-worker.js`) porque Wiro/Higgsfield no admiten llamadas directas desde el navegador (CORS). Ver `worker/LEEME.md`. Los secretos (`WIRO_KEY`, `WIRO_SECRET`, `APP_TOKEN`) se configuran en Cloudflare, nunca aquí.

## Cómo publicar
`git pull`, editar, subir la versión de `sw.js`, `git add` + `git commit` + `git push` a `main`. En 1-2 minutos está en la web. Dani tiene que cerrar la app del todo y reabrirla para ver lo nuevo.

## Convenciones de contenido
- Las descripciones de fichas para prompts van **siempre en inglés**; el nombre y la interfaz, en español.
- Peinados: miniaturas siempre de frente; no inventar peinados, usar la descripción del catálogo.
- Todas las miniaturas con el mismo fondo neutro (`NEUTRAL_BG`).
- Galerías: el nombre va debajo de la foto (no encima), sin línea de tipo; los tamaños S/M/L deben cambiar de verdad.
