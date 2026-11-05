// Feito por André Balada :)
/**
 * Envia a candidatura para o Apps Script que grava na Google Planilha.
 * É o armazenamento oficial em produção (Vercel): se falhar, a API responde
 * erro e o formulário mantém os dados para nova tentativa.
 */
const TIMEOUT_MS = 10_000;

/**
 * Planilhas interpretam textos iniciados por = + - @ como fórmula. Um nome como
 * `=IMPORTXML(...)` poderia executar ao abrir a planilha (CSV/formula injection).
 * O apóstrofo inicial força o Sheets a tratar o valor como texto.
 */
export function toSheetSafe(value) {
  return typeof value === 'string' && /^[=+\-@\t\r]/.test(value)
    ? `'${value}`
    : value;
}

export function isGoogleSheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SHEETS_WEBHOOK_URL &&
    process.env.GOOGLE_SHEETS_WEBHOOK_SECRET,
  );
}

export async function saveApplicationInGoogleSheets(record) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;

  if (!url || !secret)
    throw new Error('A integração com Google Sheets não está configurada.');
  // O segredo vai no corpo da requisição: nunca enviar por HTTP sem TLS.
  if (!url.startsWith('https://'))
    throw new Error('GOOGLE_SHEETS_WEBHOOK_URL precisa usar HTTPS.');

  const candidatura = Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, toSheetSafe(value)]),
  );
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, candidatura }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || !result || result.success !== true)
    throw new Error('O Google Sheets não confirmou o salvamento.');
}
