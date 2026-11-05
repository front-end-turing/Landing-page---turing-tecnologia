import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
function candidaturasDevApi() {
  return {
    name: 'dev-api-candidaturas',
    configureServer(server) {
      server.middlewares.use('/api/candidaturas', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              success: false,
              message: 'Método não permitido.',
            }),
          );
          return;
        }
        const { handleApplication } = await import('./backend/handler.js');
        const { isGoogleSheetsConfigured, saveApplicationInGoogleSheets } =
          await import('./backend/google-sheets.js');

        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);
            const protocol = req.headers['x-forwarded-proto'] || 'http';
            const host = req.headers.host || 'localhost:3000';
            const url = `${protocol}://${host}/api/candidaturas`;

            const webReq = new Request(url, {
              method: 'POST',
              headers: req.headers,
              body: buffer,
            });

            const webRes = await handleApplication(webReq, async (record) => {
              // Sem .env configurado, o dev só registra o id (nunca dados pessoais).
              if (!isGoogleSheetsConfigured()) {
                console.log(
                  '[DEV API] Candidatura válida (não salva):',
                  record.id,
                );
                return;
              }
              await saveApplicationInGoogleSheets(record);
            });

            res.statusCode = webRes.status;
            webRes.headers.forEach((val, key) => res.setHeader(key, val));
            const text = await webRes.text();
            res.end(text);
          } catch (err) {
            console.error('[DEV API] Erro ao processar candidatura:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: false,
                message: 'Erro interno no servidor de dev.',
              }),
            );
          }
        });
      });
    },
  };
}

// Front-end estático: dispensa Worker/Miniflare e funciona em qualquer host.
export default defineConfig({
  resolve: {
    // Caminho absoluto também funciona no Linux da Vercel.
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
    // Os módulos locais já usam caminhos relativos e extensões explícitas.
    tsconfigPaths: false,
  },
  css: { postcss: { plugins: [tailwindcss()] } },
  // `output: 'export'` gera HTML estático em dist/client. Sem isso o build só
  // produz o servidor e a hospedagem estática (Vercel) responde 404.
  plugins: [vinext({ nextConfig: { output: 'export' } }), candidaturasDevApi()],
});
