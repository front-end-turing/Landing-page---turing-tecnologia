# Integração com o back-end

O front-end é estático e o servidor de candidaturas está separado em `backend/`. O endpoint `/api/candidaturas` é uma Vercel Function (`api/candidaturas.js`) que grava na Google Planilha pelo Apps Script. Consulte [backend/README.md](../backend/README.md) para publicação, validação e consulta dos registros.

## Onde alterar

| Necessidade                                                   | Arquivo                                                                |
| ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Contatos, logos, projetos, cursos e vagas                     | `lib/site-config.js`                                                   |
| Equipe, hierarquia, fotos e perfis individuais                | `lib/team-data.js`                                                     |
| Endereço do serviço de candidaturas                           | `siteConfig.application.endpoint` em `lib/site-config.js`              |
| Cabeçalhos, autenticação futura e tratamento da resposta HTTP | `lib/applications.js`                                                  |
| Campos, validação e mensagens da candidatura                  | `components/landing/application-form.jsx`                              |
| Estrutura das seções                                          | `components/landing/page-sections.jsx`                                 |
| Aparência e animações                                         | `app/globals.css`, `lib/page-motion.js` e `hooks/use-scroll-reveal.js` |

`teamDepartments` define a ordem das áreas. Cada área possui `id`, `name`, `leaders` e `members`: cadastre o diretor em `leaders` e sua equipe em `members`. A lista exportada `members` reúne as pessoas nessa ordem e alimenta um único carrossel horizontal. Todos os cartões passam pela mesma faixa, com o diretor imediatamente antes de sua equipe.

Cada pessoa tem `id`, `name` (primeiro e segundo nome), `fullName`, `role`, `image`, `photoFocus`, `instagram`, `linkedin` e `github`. Preserve IDs estáveis ao trocar nomes. Use caminhos públicos como `/images/optimized/membros/nome.webp` para fotos, ou URLs completas.

`photoFocus` enquadra o rosto sem alterar o arquivo original: `x` e `y` são percentuais da imagem já orientada por EXIF; `zoom` multiplica a escala mínima para preencher o círculo; `aspectRatio` é largura/altura após EXIF. `rotation` é opcional, em graus, aplicada pelo CSS depois do enquadramento. Um `image: null` mostra as iniciais. Ana Kaline usa `rotation: -90`; A cópia WebP de Kauã já contém a orientação EXIF aplicada aos pixels. Os originais não ficam no projeto; veja [IMAGENS.md](IMAGENS.md) para preparar novas versões leves. Ao substituir uma foto, revise também essas medidas.

Cada rede aceita uma URL completa ou `null`. Um link ausente abre **Contato em breve** com o texto “Este canal de contato ainda não está disponível. Volte em breve para falar com a equipe da Turing.” e o botão **Entendi**. Os perfis enviados nas capturas do formulário e o GitHub/LinkedIn de Francisco estão preenchidos; não use os perfis da empresa como se fossem perfis pessoais.

`getSocialHref`, em `lib/social-links.js`, também aceita usuários como `Kairo30ms`, `@anaps_2` e endereços sem `https://`. Remove os parâmetros de compartilhamento, transforma um repositório GitHub no perfil da respectiva conta e rejeita URLs de outra rede ou páginas genéricas como `linkedin.com/home`. Respostas como “Não tenho” ou “Desativado no momento” devem permanecer `null` no cadastro. Os perfis de Lucas não foram importados porque ele não consta na lista de membros solicitada.

## Fluxo da candidatura

1. O formulário valida os campos e monta o objeto de candidatura.
2. `sendApplication(payload, signal)` envia um POST JSON ao endpoint configurado.
3. O back-end confirma a gravação com HTTP 2xx e `{ "success": true }`.
4. Só depois da confirmação a interface limpa os campos e mostra sucesso.

Payload:

```json
{
  "nome": "Nome completo",
  "matricula": "2023012345",
  "email": "pessoa@exemplo.com",
  "celular": "(84) 9 9999-9999",
  "periodoIngresso": "2025.1",
  "curso": "sistemas-de-informacao",
  "github": "github.com/seuusuario",
  "area": "back-end"
}
```

`github` é opcional. Os valores aceitos de `curso` e `area` estão nos arrays `courses` e `roles`, compartilhados com a validação em `backend/validation.js`.

Sem endpoint, nenhum dado é transmitido. Respostas sem confirmação, erros HTTP e timeout de 15 segundos preservam os campos para nova tentativa. Envios duplicados são bloqueados enquanto a requisição está em andamento.

A Vercel cria a rota a partir de `api/candidaturas.js`. Em desenvolvimento, `pnpm dev` atende a mesma rota por um middleware em `vite.config.js`. Um upload isolado da pasta `dist/client` não tem API. Não coloque segredos em `site-config.js` ou em outros arquivos entregues ao navegador.

## Organização das interações

O carrossel usa 10 segundos a partir de 1024 px, 6 segundos de 768 a 1023 px e 3 segundos abaixo de 768 px. A função `getCarouselInterval` concentra esses limites.

`scrollToSection` mantém links HTML reais, mas anima as coordenadas com `requestAnimationFrame`. O histórico é atualizado somente no final. `cancelSectionScroll` remove a animação e os listeners ao interromper ou sair da página.

`useScrollReveal` observa os elementos com `data-reveal` e mostra cada um uma única vez. A propriedade CSS `translate` controla a entrada; `transform` controla o hover, evitando conflitos entre os efeitos.
