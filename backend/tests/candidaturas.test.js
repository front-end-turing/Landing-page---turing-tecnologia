import test from 'node:test';
import assert from 'node:assert/strict';
import { handleApplication } from '../handler.js';
import { validateApplication } from '../validation.js';

const valid = {
  nome: 'Pessoa de Teste',
  matricula: '2025012345',
  email: 'TESTE@example.com',
  celular: '(84) 9 9999-9999',
  periodoIngresso: '2025.1',
  curso: 'sistemas-de-informacao',
  github: 'usuario-teste',
  area: 'front-end',
};
const request = (body, headers = {}) =>
  new Request('https://turing.example/api/candidaturas', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://turing.example',
      ...headers,
    },
    body: JSON.stringify(body),
  });

test('grava somente campos permitidos, normalizados, e confirma após a persistência', async () => {
  let saved;
  const response = await handleApplication(
    request({ ...valid, admin: true }),
    async (record) => {
      saved = record;
    },
  );
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { success: true });
  assert.equal(saved.email, 'teste@example.com');
  assert.equal(saved.github, 'https://github.com/usuario-teste');
  assert.equal(saved.admin, undefined);
  assert.match(saved.id, /^[a-f0-9-]{36}$/);
  assert.ok(Date.parse(saved.createdAt));
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('falha no armazenamento nunca retorna sucesso nem expõe detalhes internos', async () => {
  const response = await handleApplication(request(valid), async () => {
    throw new Error('segredo-interno');
  });
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.success, false);
  assert.ok(!JSON.stringify(body).includes('segredo-interno'));
});

test('campos inválidos são rejeitados antes de salvar', async () => {
  for (const input of [
    null,
    [],
    { ...valid, nome: '' },
    { ...valid, email: 'erro' },
    { ...valid, celular: '123' },
    { ...valid, periodoIngresso: '2025.9' },
    { ...valid, curso: 'desconhecido' },
    { ...valid, area: 'admin' },
    { ...valid, github: 'https://example.com' },
    { ...valid, matricula: 123 },
    { ...valid, nome: 'a'.repeat(121) },
    { ...valid, website: 'bot.example' },
  ]) {
    const response = await handleApplication(request(input), async () =>
      assert.fail('Não deveria salvar'),
    );
    assert.ok([400, 422].includes(response.status));
    assert.equal((await response.json()).success, false);
  }
  assert.equal(validateApplication({ ...valid, github: '' }).success, true);
});

test('método, origem, formato, JSON e tamanho são verificados', async () => {
  const neverSave = async () => assert.fail('Não deveria salvar');
  assert.equal(
    (
      await handleApplication(
        new Request('https://turing.example/api/candidaturas'),
        neverSave,
      )
    ).status,
    405,
  );
  assert.equal(
    (
      await handleApplication(
        request(valid, { origin: 'https://outra.example' }),
        neverSave,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await handleApplication(
        request(valid, { 'content-type': 'text/plain' }),
        neverSave,
      )
    ).status,
    415,
  );
  assert.equal(
    (
      await handleApplication(
        request({ ...valid, extra: 'x'.repeat(9000) }),
        neverSave,
      )
    ).status,
    413,
  );
  const malformed = new Request('https://turing.example/api/candidaturas', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{',
  });
  assert.equal((await handleApplication(malformed, neverSave)).status, 400);
});

test('valores enviados à planilha não viram fórmula', async () => {
  const { toSheetSafe } = await import('../google-sheets.js');
  assert.equal(
    toSheetSafe('=IMPORTXML("https://x")'),
    `'=IMPORTXML("https://x")`,
  );
  assert.equal(toSheetSafe('+5584999999999'), `'+5584999999999`);
  assert.equal(toSheetSafe('@usuario'), `'@usuario`);
  assert.equal(toSheetSafe('Pessoa de Teste'), 'Pessoa de Teste');
});

test('sem configuração do Google Sheets a gravação falha (nunca finge sucesso)', async () => {
  const { saveApplicationInGoogleSheets } = await import('../google-sheets.js');
  const saved = { ...process.env };
  delete process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  delete process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  try {
    await assert.rejects(saveApplicationInGoogleSheets({ id: '1' }));
    process.env.GOOGLE_SHEETS_WEBHOOK_URL = 'http://inseguro.example';
    process.env.GOOGLE_SHEETS_WEBHOOK_SECRET = 'x';
    await assert.rejects(saveApplicationInGoogleSheets({ id: '1' }), /HTTPS/);
  } finally {
    process.env = saved;
  }
});

test('limite por IP bloqueia excesso e libera após a janela', async () => {
  const { createRateLimiter } = await import('../rate-limit.js');
  const limited = createRateLimiter({ limit: 2, windowMs: 1000 });
  assert.equal(limited('ip', 0), false);
  assert.equal(limited('ip', 1), false);
  assert.equal(limited('ip', 2), true);
  assert.equal(limited('outro-ip', 2), false);
  assert.equal(limited('ip', 1001), false);
});

test('função da Vercel responde 405 para GET e 503 sem armazenamento configurado', async () => {
  const { GET, POST } = await import('../../api/candidaturas.js');
  const saved = { ...process.env };
  delete process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  delete process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  try {
    assert.equal(
      (await GET(new Request('https://turing.example/api/candidaturas')))
        .status,
      405,
    );
    assert.equal((await POST(request(valid))).status, 503);
  } finally {
    process.env = saved;
  }
});
