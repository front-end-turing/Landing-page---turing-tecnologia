# Turing Tecnologia — Landing page

Site institucional da **Turing Tecnologia**, Empresa Júnior de Tecnologia da UFERSA Angicos. Apresenta serviços, equipe e portfólio, e recebe candidaturas pelo formulário "Candidate-se para a Turing".

- **Front-end:** React 19 com [vinext](https://github.com/cloudflare/vinext), que implementa a API do Next.js (App Router) sobre o Vite 8, e Tailwind CSS 4. O build gera HTML estático (`output: 'export'`).
- **Back-end:** uma Vercel Function em `/api/candidaturas` que valida a candidatura e a grava numa Google Planilha via Apps Script.
- **Hospedagem:** Vercel.

## Requisitos

- Node.js **22.13+ ou 24** (recomendado: 24 LTS)
- pnpm **11.19.0**. Com Corepack, a versão fixada em `package.json` é usada automaticamente:

```bash
corepack enable
```

Sem Corepack, use `npx pnpm@11.19.0 <comando>` no lugar de `pnpm`.

## Rodando localmente

```bash
pnpm install
```

```bash
cp .env.example .env
```

Preencha o `.env` com a URL e o segredo do Apps Script (veja [Variáveis de ambiente](#variáveis-de-ambiente)). Sem o `.env`, o formulário funciona em desenvolvimento, mas as candidaturas não são salvas: o terminal mostra apenas o id.

```bash
pnpm dev
```

O site abre em `http://localhost:3000`. No modo dev, `/api/candidaturas` é servido por um middleware do Vite (`vite.config.js`) que usa o mesmo código da função de produção.

## Scripts

| Comando       | O que faz                                                   |
| ------------- | ----------------------------------------------------------- |
| `pnpm dev`    | Servidor de desenvolvimento com recarregamento automático   |
| `pnpm build`  | Gera o site estático em `dist/client`                       |
| `pnpm test`   | Testes do back-end (validação, segurança, limite de envios) |
| `pnpm lint`   | Análise estática com oxlint                                 |
| `pnpm format` | Formatação com oxfmt                                        |

## Estrutura

```
app/                    Layout, página e CSS global (App Router)
components/landing/     Seções da página (header, hero, equipe, portfólio, formulário…)
components/ui/          Componentes base (dialog, select, button) sobre Base UI
lib/site-config.js      Contatos, projetos, cursos e vagas (front-end + validação)
lib/team-data.js        Membros da equipe, fotos e redes sociais
api/candidaturas.js     Vercel Function: POST /api/candidaturas
backend/                Lógica do formulário: handler HTTP, validação, Google Sheets, rate limit e testes
public/images/          Logos e fotos otimizadas (WebP)
docs/                   Detalhes do back-end e das imagens
vercel.json             Build, pasta publicada e headers de segurança
pnpm-workspace.yaml     Pacotes autorizados a rodar scripts de instalação e overrides de segurança
```

Para alterar o conteúdo do site, comece por `lib/site-config.js` e `lib/team-data.js`. Mais detalhes em [docs/BACKEND.md](docs/BACKEND.md) e [docs/IMAGENS.md](docs/IMAGENS.md).

## Deploy na Vercel

1. Envie o repositório para o GitHub. O `.gitignore` já impede o envio de `.env`, `node_modules` e `dist`.
2. Na Vercel, clique em **Add New → Project** e importe o repositório. As configurações de build vêm do `vercel.json`, então não altere nada em *Build & Output Settings*.
3. Em **Settings → Environment Variables**, cadastre `GOOGLE_SHEETS_WEBHOOK_URL` e `GOOGLE_SHEETS_WEBHOOK_SECRET` em *Production* e, se quiser testar, em *Preview*.
4. Faça o deploy. Depois, envie uma candidatura fictícia e confirme que ela aparece na planilha.
5. Recomendado: em **Firewall → Rules**, crie uma regra de *Rate Limit* para o caminho `/api/candidaturas` (por exemplo, 10 requisições por minuto por IP). A função já tem um limite por instância, mas a regra do Firewall vale para todas as instâncias.

O `vercel.json` instala as dependências com `pnpm@11.19.0` e `--frozen-lockfile`, gera o build e publica `dist/client`. Arquivos em `api/` viram funções automaticamente.

## Variáveis de ambiente

| Variável                       | Onde é usada            | Descrição                                       |
| ------------------------------ | ----------------------- | ----------------------------------------------- |
| `GOOGLE_SHEETS_WEBHOOK_URL`    | Somente no servidor     | URL `https://script.google.com/.../exec` do Apps Script |
| `GOOGLE_SHEETS_WEBHOOK_SECRET` | Somente no servidor     | Segredo compartilhado, conferido pelo Apps Script |

Nunca use o prefixo `NEXT_PUBLIC_` nessas variáveis, porque esse prefixo as envia ao navegador. Se o segredo vazar, gere outro e atualize o Apps Script e a Vercel ao mesmo tempo.

## Segurança

- **Validação no servidor:** apenas campos previstos são aceitos, com limite de tamanho, lista fechada de cursos e vagas, e normalização do GitHub (`backend/validation.js`).
- **Proteções da API:** só aceita `POST` JSON de até 8 KiB vindo do próprio site (verificação de `Origin`/`Sec-Fetch-Site`), tem um campo antispam invisível e um limite de 10 envios por minuto por IP.
- **Planilha:** valores que começam com `=`, `+`, `-` ou `@` recebem um apóstrofo, para não serem executados como fórmula (*formula injection*).
- **Sem sucesso falso:** se a gravação na planilha falhar ou não estiver configurada, a API responde erro e o formulário mantém os dados para nova tentativa.
- **Headers HTTP:** Content-Security-Policy, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy` e `Permissions-Policy` em `vercel.json`. A Vercel adiciona HSTS.
- **Dependências:** `pnpm audit` sem vulnerabilidades conhecidas (novembro de 2026). O pnpm 11 bloqueia versões publicadas há menos de 24 h e scripts de instalação não autorizados (`pnpm-workspace.yaml`).
- **Logs:** dados pessoais e credenciais nunca são registrados.

Rode periodicamente:

```bash
pnpm audit
```

## Licença

© Turing Tecnologia. Todos os direitos reservados.
