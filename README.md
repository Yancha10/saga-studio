# Saga Studio

Estudio personal para crear las imágenes, vídeos y audios de mis personajes.

Web: `https://<tu-usuario>.github.io/saga-studio/`

## Cómo se publica (una sola vez)

1. En GitHub: **New repository** → nombre `saga-studio` → Public → *Create repository*.
2. En el repo vacío: **uploading an existing file** → arrastra todo lo de esta carpeta (incluido `.nojekyll`; en Mac, `Cmd+Shift+.` muestra los archivos ocultos) → *Commit changes*.
3. **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → *Save*.
4. En 1-2 minutos está en `https://<tu-usuario>.github.io/saga-studio/`.

Para actualizar: sube el `index.html` nuevo encima (Add file → Upload files) y listo.

## En el móvil

Ábrela en Safari → Compartir → **Añadir a pantalla de inicio**. Se abre como una app y funciona sin conexión.

## Tus datos

- Todo se guarda **en el navegador de cada dispositivo** (nada se sube a GitHub).
- Para pasar tu trabajo del Mac al móvil: menú de tu cuenta (la **D** de arriba) → **Guardar copia completa**, y en el otro dispositivo → **Restaurar copia**.
- Tu vestidor de Notion va dentro de la web (carpeta `vestidor/`): se carga solo la primera vez que abres la app en cada dispositivo.

## Archivos

| Archivo | Para qué |
|---|---|
| `index.html` | La app entera |
| `manifest.webmanifest`, `icon*.png`, `icon.svg`, `apple-touch-icon.png` | Icono y modo app en el móvil |
| `sw.js` | Hace que funcione sin conexión |
| `vestidor/` | Tus 261 prendas de Notion (fichas + fotos) |
| `.nojekyll` | Que GitHub sirva los archivos tal cual |
