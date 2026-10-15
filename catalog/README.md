# Catálogos de modelos

Archivos que la app lee de la web (y guarda para usarlos sin conexión). Nunca llevan claves ni datos de nadie.

| Archivo | Qué es |
|---|---|
| `families.v1.json` | Qué modelo de cada servicio es el mismo que uno de la lista de Saga Studio (salen como «Recomendados»). |
| `fal.v1.json` | Modelos de fal comprobados en sus fichas oficiales (id y campo que recibe las imágenes). Puedes añadir más a mano por su id. |
| `pollo.v1.json` | Modelos de Pollo y sus campos. Pollo no tiene una API pública para listar modelos, así que se mantiene a mano. |

Wiro se lista en vivo desde su API (`/Tool/List`, `/Tool/Detail`). fal no publica una lista para el navegador: `fal.v1.json` se mantiene a mano desde `https://fal.ai/models/<id>/llms.txt`, y cada persona puede añadir otros por su id.

## Cómo se actualizan

1. Abre la documentación oficial del servicio (p. ej. `https://docs.pollo.ai/m/<fabricante>/<modelo>`).
2. Copia solo lo que diga la documentación: id (`fabricante/modelo`), nombre, campos de `input` y su tipo. Nada de suposiciones; si un campo no está claro, no se pone.
3. Pon la fecha en `reviewed` y la página en `src`.
4. En `families.v1.json`, añade un enlace solo si la documentación del servicio deja claro que es el mismo modelo.
5. Comprueba que el JSON es válido (`node -e "JSON.parse(require('fs').readFileSync('catalog/pollo.v1.json'))"`) y sube también `sw.js` con la versión siguiente.

Todo texto de un catálogo se trata como texto sin confianza: la app lo limpia y lo escapa al mostrarlo, nunca lo ejecuta.
