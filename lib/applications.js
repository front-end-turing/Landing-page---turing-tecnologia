import { siteConfig } from './site-config.js';
export class ApplicationError extends Error {}
/**
 * Único ponto de envio de candidaturas. O back-end recebe os dados do formulário
 * por POST JSON e confirma a gravação com HTTP 2xx + { success: true }.
 * O formulário controla timeout, validação e mensagens para o usuário.
 */
export async function sendApplication(payload, signal) {
  const endpoint = siteConfig.application.endpoint;
  if (!endpoint) throw new Error('Application endpoint is not configured.');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });
  const result = await response.json().catch(() => null);
  if (
    !response.ok ||
    typeof result !== 'object' ||
    result === null ||
    !('success' in result) ||
    result.success !== true
  ) {
    const message =
      response.status === 429
        ? 'Você enviou muitas tentativas. Aguarde um minuto e tente novamente.'
        : result &&
            typeof result === 'object' &&
            'message' in result &&
            typeof result.message === 'string'
          ? result.message
          : 'Não foi possível enviar sua candidatura. Tente novamente em instantes.';
    throw new ApplicationError(message);
  }
}
