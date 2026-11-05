import { validateApplication } from './validation.js';
const MAX_BODY_BYTES = 8192;
function json(status, body, headers = {}) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', ...headers },
  });
}
/** HTTP separado do armazenamento para permitir testes sem dados reais. */
export async function handleApplication(request, save) {
  if (request.method !== 'POST')
    return json(
      405,
      { success: false, message: 'Método não permitido.' },
      { Allow: 'POST' },
    );
  const origin = request.headers.get('origin');
  if (
    (origin && origin !== new URL(request.url).origin) ||
    request.headers.get('sec-fetch-site') === 'cross-site'
  )
    return json(403, {
      success: false,
      message: 'Envie a candidatura pelo site da Turing.',
    });
  if (
    request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !==
    'application/json'
  )
    return json(415, { success: false, message: 'Formato de envio inválido.' });
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES)
    return json(413, {
      success: false,
      message: 'O formulário excedeu o tamanho permitido.',
    });
  let input;
  try {
    const body = await request.arrayBuffer();
    if (body.byteLength > MAX_BODY_BYTES)
      return json(413, {
        success: false,
        message: 'O formulário excedeu o tamanho permitido.',
      });
    input = JSON.parse(new TextDecoder().decode(body));
  } catch {
    return json(400, {
      success: false,
      message: 'Não foi possível ler o formulário.',
    });
  }
  // Campo invisível para pessoas, usado para rejeitar preenchimentos automatizados.
  if (input && typeof input === 'object' && 'website' in input && input.website)
    return json(400, {
      success: false,
      message: 'Não foi possível validar o envio.',
    });
  const result = validateApplication(input);
  if (!result.success) return json(422, result);
  try {
    await save({
      ...result.data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    });
    return json(201, { success: true });
  } catch {
    // Nunca registrar o formulário ou detalhes das credenciais nos logs.
    return json(503, {
      success: false,
      message: 'Não foi possível salvar agora. Tente novamente em instantes.',
    });
  }
}
