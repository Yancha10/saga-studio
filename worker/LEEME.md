# Puente de Higgsfield para Saga Studio

1. Entra en https://dash.cloudflare.com (cuenta gratis) → Workers & Pages → Create → Create Worker. Nómbralo `saga-higgsfield` y pulsa Deploy.
2. Pulsa «Edit code», borra lo que hay, pega todo el contenido de `higgsfield-worker.js` y pulsa Deploy.
3. En el Worker: Settings → Variables and Secrets → Add (tipo **Secret**), tres veces:
   - `HF_KEY_ID` y `HF_KEY_SECRET`: de https://console.higgsfield.ai (API Keys).
   - `APP_TOKEN`: una contraseña larga que te inventes.
4. Copia la dirección del Worker (`https://saga-higgsfield.TU-USUARIO.workers.dev`).
5. En Saga Studio: Mis APIs → Higgsfield → Conectar: pega la dirección y la contraseña (`APP_TOKEN`) → «Probar».
