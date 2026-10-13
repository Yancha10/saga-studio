# Saga Studio

Estudio personal para crear las imágenes, vídeos y audios de mis personajes.

Web: `https://<tu-usuario>.github.io/saga-studio/`

## Cómo se publica (una sola vez)

1. En GitHub: **New repository** → nombre `saga-studio` → Public → *Create repository*.
2. En el repo vacío: **uploading an existing file** → arrastra todo lo de esta carpeta (incluido `.nojekyll`; en Mac, `Cmd+Shift+.` muestra los archivos ocultos) → *Commit changes*.
3. **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → *Save*.
4. En 1-2 minutos está en `https://<tu-usuario>.github.io/saga-studio/`.

Para actualizar: sube el `index.html` nuevo encima (Add file → Upload files) y listo. Si cambias `sw.js`, sube la versión nueva de la constante `C` (`saga-v11` → `saga-v12`…): la app abierta se actualiza sola cuando no estás a mitad de nada.

## En el móvil

Ábrela en Safari → Compartir → **Añadir a pantalla de inicio**. Se abre como una app y funciona sin conexión.

## Tus datos

- Todo se guarda **en el navegador de cada dispositivo** (nada se sube a GitHub). La app pide al navegador que no lo borre aunque le falte espacio.
- **Google Drive** (botón *Drive* de arriba): tus datos, fotos y vídeos iguales en el Mac y el móvil. Nunca se guarda encima de algo del Drive que el dispositivo no haya visto: si los dos han cambiado, te pregunta con qué te quedas, y lo otro se guarda como punto de recuperación.
- **Copia completa**: menú de tu cuenta (la **D** de arriba) → **Guardar copia completa**, y en otro dispositivo → **Restaurar copia**. Las copias muy grandes (más de ~500 MB) pueden fallar en algunos navegadores: para eso, mejor Drive.
- **Puntos de recuperación**: antes de restaurar una copia o de cargar lo del Drive, la app guarda cómo estaba todo (los 4 últimos, en ese dispositivo). Menú de tu cuenta → **Puntos de recuperación** para volver atrás.
- Si alguna vez lo guardado no se puede leer, la app entra en **modo recuperación**: no borra nada y te deja descargarlo, restaurar una copia o volver a un punto de recuperación.
- Las fotos y vídeos que ya no usa nada se borran solos a los 7 días (nunca si están en la papelera o en un punto de recuperación). En Drive van a la papelera de Drive.
- **Generar directo (opcional)**: en **Mis APIs** puedes conectar tus propias cuentas de Wiro, Pollo o fal (pagas tú directamente a cada servicio; Saga Studio no tiene claves ni saldo propios). Pulsa **Probar** (no gasta nada) y luego, en Crear imagen o Crear vídeo, **Generar con** → elige el modelo. Cada generación pide confirmación antes de cobrar, aparece en **Trabajos** y al terminar se guarda sola en Creaciones. Las claves se quedan solo en ese dispositivo y en esa cuenta: nunca van a Drive, a las copias ni a los puntos de recuperación. El modo manual (copiar prompt → generar fuera → importar) sigue igual.
- **Catálogos de modelos**: carpeta `catalog/` (ver `catalog/README.md` para actualizarlos).
- Tu vestidor de Notion va dentro de la web (carpeta `vestidor/`): se carga entero la primera vez; si publicas uno nuevo, solo se añaden las prendas nuevas (tus cambios en las que ya tienes no se tocan).

## Archivos

| Archivo | Para qué |
|---|---|
| `index.html` | La app entera |
| `manifest.webmanifest`, `icon*.png`, `icon.svg`, `apple-touch-icon.png` | Icono y modo app en el móvil |
| `sw.js` | Hace que funcione sin conexión |
| `catalog/` | Listas de modelos de los servicios (y cómo se relacionan con los de la app) |
| `vestidor/` | Tus 261 prendas de Notion (fichas + fotos) |
| `.nojekyll` | Que GitHub sirva los archivos tal cual |
