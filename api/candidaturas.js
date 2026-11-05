import { saveApplicationInGoogleSheets } from '../backend/google-sheets.js';
import { handleApplication } from '../backend/handler.js';
import { createRateLimiter, getClientIp } from '../backend/rate-limit.js';

/**
 * Vercel Function publicada em /api/candidaturas.
 * Variáveis necessárias (Settings → Environment Variables na Vercel):
 * GOOGLE_SHEETS_WEBHOOK_URL e GOOGLE_SHEETS_WEBHOOK_SECRET.
 */
const isRateLimited = createRateLimiter({ limit: 10, windowMs: 60_000 });

async function candidaturas(request) {
  if (request.method === 'POST' && isRateLimited(getClientIp(request)))
    return Response.json(
      {
        success: false,
        message:
          'Você enviou muitas tentativas. Aguarde um minuto e tente novamente.',
      },
      {
        status: 429,
        headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' },
      },
    );
  return handleApplication(request, saveApplicationInGoogleSheets);
}

// Outros métodos recebem 405 do próprio handler.
export {
  candidaturas as GET,
  candidaturas as POST,
  candidaturas as PUT,
  candidaturas as PATCH,
  candidaturas as DELETE,
};
