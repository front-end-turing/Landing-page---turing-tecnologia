# Back-end de candidaturas

Esta pasta contém a lógica do formulário. A Vercel publica `api/candidaturas.js`, na raiz do projeto, como uma Function em `/api/candidaturas`. Essa função apenas aplica o limite de envios e chama o código desta pasta.

| Arquivo            | Responsabilidade                                                         |
| ------------------ | ------------------------------------------------------------------------ |
| `handler.js`       | HTTP: método, origem, formato, tamanho, antispam e resposta              |
| `validation.js`    | Validação e normalização dos campos; descarta campos não previstos       |
| `google-sheets.js` | Envio ao Apps Script da planilha, com timeout e proteção contra fórmulas |
| `rate-limit.js`    | Limite de 10 envios por minuto por IP (por instância)                    |
| `tests/`           | Testes com `node:test`, sem enviar dados reais                           |

## Fluxo

1. O front-end envia JSON para `/api/candidaturas`.
2. `api/candidaturas.js` bloqueia o IP que passar de 10 envios por minuto (`429`).
3. `handler.js` verifica método, origem, formato, tamanho e campo antispam.
4. `validation.js` valida os dados e remove campos não previstos.
5. `google-sheets.js` envia `{ secret, candidatura }` ao Apps Script, com identificador aleatório e data UTC.
6. A API só retorna `201` com `{ "success": true }` depois que o Apps Script confirma `{ "success": true }`.

Se a integração não estiver configurada, demorar mais de 10 segundos ou falhar, a API responde `503` e o formulário mantém os dados.

## Apps Script (planilha)

O Apps Script publicado como *Web App* deve:

- conferir se `secret` é igual ao segredo configurado (por exemplo, guardado em *Propriedades do script*) e recusar caso contrário;
- gravar os campos de `candidatura` numa linha da planilha;
- responder `{ "success": true }` em JSON (`ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON)`).

Valores que começam com `=`, `+`, `-` ou `@` chegam com um apóstrofo inicial. O Sheets o esconde e trata o valor como texto, evitando *formula injection*.

## Contrato

```http
POST /api/candidaturas
Content-Type: application/json
```

```json
{
  "nome": "Pessoa de Teste",
  "matricula": "2025012345",
  "email": "teste@example.com",
  "celular": "(84) 9 9999-9999",
  "periodoIngresso": "2025.1",
  "curso": "sistemas-de-informacao",
  "github": "github.com/usuario-teste",
  "area": "front-end",
  "website": ""
}
```

`github` é opcional. `website` é um campo antispam e deve ficar vazio; não é armazenado. Os demais campos são obrigatórios. O período aceita ano e semestre 1 ou 2 (`2025.1`, `2025/1` ou `2025-1`). O celular precisa de 10 a 15 dígitos, com DDD. Perfis GitHub são normalizados para HTTPS.

Cursos: `sistemas-de-informacao`, `licenciatura-em-informatica`.

Áreas: `rh`, `back-end`, `front-end`, `ui-ux`, `marketing`, `consultoria`, `financeiro`.

| Status    | Significado                                    |
| --------- | ---------------------------------------------- |
| 201       | Candidatura salva na planilha                  |
| 400 / 422 | JSON, antispam ou campos inválidos             |
| 403       | Origem de outro site                           |
| 405       | Método diferente de POST                       |
| 413       | Corpo maior que 8 KiB                          |
| 415       | Formato diferente de JSON                      |
| 429       | Mais de 10 envios por minuto do mesmo IP       |
| 503       | Planilha não configurada ou indisponível       |

Erros retornam `{ "success": false, "message": "..." }`. A função não registra dados pessoais nem credenciais nos logs.

## Manutenção

- Altere vagas e cursos em `lib/site-config.js`: front-end e validação usam as mesmas listas.
- Altere regras dos campos em `backend/validation.js`.
- Para trocar a planilha por um banco de dados, substitua a função de gravação passada a `handleApplication` em `api/candidaturas.js`.
- Segredos ficam em **Settings → Environment Variables** na Vercel e no `.env` local, nunca no código, no navegador ou no GitHub.
- A equipe deve definir o prazo de retenção das candidaturas e apagar da planilha as que não precisam mais ser mantidas (LGPD).

## Testes

Na raiz, execute:

```bash
pnpm test
```

Os testes cobrem gravação, falha de armazenamento, validação, origem, métodos, tamanho, proteção contra fórmulas, limite de envios e a função da Vercel. A gravação é simulada e nenhuma candidatura real é enviada.
