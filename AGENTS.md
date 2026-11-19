# AGENTS.md — Brunna Fortuna Advocacia

Guia de trabalho para qualquer agente de IA (Claude, Codex, Cursor etc.) neste repositório. **Leia este arquivo inteiro antes de qualquer alteração.**

---

## 1. Visão geral do projeto

Landing page institucional de **Brunna Fortuna Advocacia**, escritório da advogada Brunna Fortuna.

| Item | Valor |
| --- | --- |
| Área de atuação | Direito das Famílias e das Sucessões |
| Especialização | Especialista em Direito das Famílias e Sucessões pela Escola Paulista de Direito (EPD) |
| Institucional | Membro da Diretoria do IBDFAM-BA (Instituto Brasileiro de Direito de Família, seção Bahia) |
| Atividades | Advocacia consultiva e contenciosa, palestrante |
| Idioma | Português do Brasil (pt-BR) |
| Objetivo do site | Passar autoridade e confiança, explicar as áreas de atuação e levar o visitante ao contato (WhatsApp ou formulário) |
| Tom | Sóbrio, acolhedor, sofisticado e humano. Os temas são sensíveis (divórcio, guarda, luto, herança), então o texto não pode ser agressivo nem comercial demais |

O diferencial do projeto são as **animações de scroll**. Elas vêm do site de referência clonado em `src/clone`. Trate essa parte como **prioridade número um**, sem abrir mão de desempenho, acessibilidade e SEO.

---

## 2. Stack e convenções

- **Angular** (versão do `package.json`; não faça downgrade nem upgrade de versão maior sem pedir) com **TypeScript em modo strict**.
- **Standalone components** em tudo. Nada de `NgModule`.
- **Signals** (`signal`, `computed`, `input()`, `output()`) para estado e entradas. Use `inject()` em vez de injeção pelo construtor.
- **Control flow nativo** (`@if`, `@for`, `@defer`). Não use `*ngIf`/`*ngFor`.
- `ChangeDetectionStrategy.OnPush` em todos os componentes.
- **SSR e prerender** com `@angular/ssr` (se ainda não estiver instalado: `ng add @angular/ssr`) e prerender da rota `/`. Isso é obrigatório para o SEO: o HTML entregue ao Google precisa já ter todo o conteúdo.
- Estilos em **SCSS**, com design tokens em CSS custom properties (`src/styles/_tokens.scss`). Sem Bootstrap ou Tailwind, a não ser que o usuário peça.
- Imagens com **`NgOptimizedImage`** (`ngSrc`, `width`/`height` ou `fill`, `priority` só na imagem do hero).
- Nomes de arquivos em **kebab-case**. Nomes de classes, variáveis e código em **inglês**. Todo o texto visível em **português**.
- Não adicione dependências sem justificar. Bibliotecas de animação são aceitas só se o clone já usar a mesma (ver seção 4).

### Estrutura de pastas esperada

```
src/
├── app/
│   ├── core/
│   │   ├── animations/        # serviço e diretivas de scroll (port do clone)
│   │   ├── seo/               # SeoService, JSON-LD
│   │   └── data/              # conteúdo do site tipado (site-content.ts)
│   ├── sections/              # hero, about, practice-areas, approach, speaking, faq, contact
│   ├── shared/                # header, footer, botões, whatsapp-fab, ícones
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── clone/                     # SOMENTE REFERÊNCIA, nunca entra no bundle
├── styles/                    # _tokens.scss, _typography.scss, _reset.scss, _mixins.scss
└── styles.scss
public/                        # logo, fotos da advogada, favicon, og-image, robots.txt, sitemap.xml
docs/
└── clone-analysis.md          # gerado pelo agente na Fase 0
```

---

## 3. A pasta `src/clone` (referência)

`src/clone` tem a cópia do site **ERA Residence** (<https://www.era-residence.com/>), feita com o vibecloner. Regras:

- **Só para estudo.** Nunca importe, referencie ou empacote arquivos de `src/clone` no app. Garanta que ela fique fora do build:
  - em `tsconfig.app.json`: `"exclude": ["src/clone/**"]`;
  - não inclua `src/clone` em `assets` nem em `styles` no `angular.json`.
- Aproveite **apenas o comportamento de movimento**: timings, easings, sequências, padrões de scroll (pin, parallax, reveal, split text, máscara de imagem, scrub, troca de cor de fundo, smooth scroll etc.).
- **Não copie a identidade do ERA**: nenhum texto, imagem, logo, fonte licenciada, nome ou layout idêntico de marca. O resultado precisa ser uma marca própria da Brunna Fortuna Advocacia.
- Antes de programar qualquer seção, gere `docs/clone-analysis.md` (ver `PROMPT.md`, Fase 0) com o inventário das animações e de como cada uma será portada.
- Código minificado ou empacotado do clone deve ser **reescrito em TypeScript limpo e tipado**, sem colar blocos minificados.

---

## 4. Animações de scroll (prioridade máxima)

### Arquitetura

Centralize tudo em `src/app/core/animations/`:

- `scroll-animation.service.ts`: inicializa a biblioteca (ex.: GSAP + ScrollTrigger, Lenis), registra plugins, faz o refresh e expõe utilitários;
- **diretivas reutilizáveis** aplicadas no template, por exemplo `appReveal`, `appParallax`, `appSplitText`, `appPinSection`, `appImageMask`, `appCounter`, `appBgShift`. Cada padrão encontrado no clone vira uma diretiva configurável por `input()`.

Se o clone usar GSAP/ScrollTrigger/Lenis/Locomotive, use a mesma lib via npm (versão atual, licença compatível). Se usar animação própria com `IntersectionObserver` ou CSS, reimplemente da mesma forma, sem lib extra.

### Regras obrigatórias

- **Compatível com SSR:** nenhum acesso a `window`, `document` ou `gsap` no servidor. Inicialize com `afterNextRender()` ou proteja com `isPlatformBrowser()`.
- **Fora da zona do Angular:** rode loops e listeners de scroll dentro de `NgZone.runOutsideAngular()`.
- **Limpeza:** todo ScrollTrigger, timeline, observer e instância do Lenis é destruído no `DestroyRef.onDestroy` (use `gsap.context()` + `ctx.revert()`).
- **Conteúdo visível sem JS:** o estado inicial "escondido" só pode ser aplicado depois que o JS iniciar (ex.: classe `.js-anim` no `<html>`). O HTML do SSR precisa ser legível e indexável sem animação.
- **`prefers-reduced-motion: reduce`:** desligue parallax, pin, scrub e smooth scroll; mostre o conteúdo direto ou com um fade curto.
- **Desempenho:** anime só `transform` e `opacity` (e `clip-path` quando necessário). Nada de animar `top`, `left`, `width`, `height` ou `margin`. Use `will-change` com moderação e remova depois. Meta: 60 fps num celular intermediário.
- **Sem CLS:** reserve o espaço dos elementos animados. Animação nunca empurra layout.
- **Mobile:** simplifique onde preciso (pins longos e parallax pesado viram reveals simples abaixo de 768px), via `gsap.matchMedia()` ou `matchMedia`.
- **Âncoras e smooth scroll:** os links do menu devem rolar até a seção certa com o smooth scroll ativo, compensando a altura do header fixo, e o foco deve ir para a seção (acessibilidade).
- Recalcule os gatilhos depois que imagens e fontes carregarem (`ScrollTrigger.refresh()`).

---

## 5. Design

- **Identidade:** extraia a paleta principal do logo em `public/`. Direção sugerida: neutros quentes (off-white, areia, grafite) com uma cor de destaque vinda do logo. Elegância editorial, muito respiro, nada de visual "jurídico clichê" (martelo, balança, colunas gregas).
- **Tipografia:** uma serifada elegante para títulos (ex.: Cormorant Garamond, Playfair Display ou Fraunces) e uma sans legível para texto (ex.: Inter, Manrope ou DM Sans), carregadas com `font-display: swap`, de preferência hospedadas localmente. Use tamanhos fluidos com `clamp()`.
- **Imagens:** use somente as de `public/`. Liste os arquivos antes de usar e escolha a melhor foto para o hero e para a seção "Sobre". **Nunca invente caminhos de arquivo.**
- **Responsividade total:** teste em 320, 375, 414, 768, 1024, 1280, 1440, 1920 e 2560px. Mobile-first. Áreas de toque com no mínimo 44×44px. Sem rolagem horizontal em nenhuma largura.

---

## 6. Conteúdo e ética da OAB (Provimento 205/2021)

A publicidade na advocacia segue o Provimento 205/2021 do CFOAB, o Código de Ética e Disciplina e o Estatuto da Advocacia. O site é **informativo, nunca mercantil**.

**Proibido:**

- prometer resultado ("ganhe sua causa", "100% de êxito", "resolvemos rápido");
- mostrar preço, honorários, descontos, "consulta grátis" ou promoções;
- usar linguagem sensacionalista, superlativa ou de captação ("o melhor escritório", "não perca tempo");
- usar símbolos ou logotipo da OAB;
- publicar depoimentos de clientes ou citar casos e clientes;
- fazer comparação com outros advogados.

**Obrigatório:**

- nome da advogada e número de inscrição na OAB visíveis (rodapé e seção de contato);
- textos de caráter educativo e informativo.

Logos de terceiros (IBDFAM, EPD): só use se o arquivo estiver em `public/` e houver autorização. Caso contrário, cite as instituições em texto.

### Dados que não podem ser inventados

**Nunca invente** número da OAB, telefone, e-mail, endereço, cidade, redes sociais, datas ou nomes de palestras. Centralize tudo em `src/app/core/data/site-content.ts` e use placeholders explícitos, por exemplo `'TODO: OAB/BA nº XXXXX'`. No fim de cada tarefa, **liste os TODOs pendentes**.

---

## 7. SEO (obrigatório)

- `<html lang="pt-BR">`, um único `<h1>` (no hero), hierarquia de headings correta e HTML semântico (`header`, `nav`, `main`, `section` com `aria-labelledby`, `footer`).
- `SeoService` usando `Title` e `Meta`: title com até ~60 caracteres, meta description com 140–160, canonical, robots, theme-color.
- Open Graph e Twitter Card com `public/og-image.jpg` (1200×630).
- **JSON-LD injetado no SSR:** `LegalService` (ou `Attorney`) + `Person` (com `knowsAbout`, `memberOf` IBDFAM, `alumniOf` EPD) + `FAQPage` para a seção de FAQ + `WebSite`. Campos sem dado real ficam **fora** do schema, nunca preenchidos com placeholders.
- `public/robots.txt` e `public/sitemap.xml` com a URL de produção (TODO se ainda não houver domínio).
- Favicons completos (`ico`, `svg`, `apple-touch-icon`, `site.webmanifest`).
- `alt` descritivo em todas as imagens de conteúdo e `alt=""` nas decorativas.
- Palavras-chave naturais no texto: "advogada de família", "direito das famílias", "direito das sucessões", "divórcio", "inventário", "planejamento sucessório", "guarda", "pensão alimentícia", mais a cidade quando ela for informada. Sem repetição forçada.
- **Core Web Vitals:** LCP < 2,5s, CLS < 0,1, INP < 200ms. Pré-carregue a imagem e a fonte do hero e use `@defer` para seções abaixo da dobra (sem quebrar o SSR do conteúdo textual).
- **Meta:** Lighthouse ≥ 95 em Performance, Acessibilidade, Boas Práticas e SEO (mobile).

---

## 8. Acessibilidade

- **WCAG 2.2 AA:** contraste ≥ 4.5:1 no texto, foco visível, navegação completa por teclado, link "Pular para o conteúdo".
- Menu mobile acessível (`aria-expanded`, `aria-controls`, trap de foco, fechar com Esc).
- Formulário com `<label>`, mensagens de erro associadas (`aria-describedby`) e checkbox de consentimento LGPD com link para a política de privacidade.

---

## 9. Comandos

```bash
npm install
npm start                 # ng serve
npm run build             # build de produção (com prerender)
npm run serve:ssr:<app>   # testar o SSR localmente (nome no package.json)
npx ng lint               # se configurado
```

---

## 10. Definição de pronto

Uma tarefa só está pronta quando:

- [ ] `npm run build` termina sem erros nem warnings novos;
- [ ] o HTML pré-renderizado (`dist/.../index.html`) contém todo o texto, as metatags e o JSON-LD;
- [ ] não há acesso a `window`/`document` no servidor (nenhum erro no console do SSR);
- [ ] as animações funcionam, são destruídas corretamente e respeitam `prefers-reduced-motion`;
- [ ] o layout foi verificado em todas as larguras da seção 5;
- [ ] nada de `src/clone` foi parar no bundle;
- [ ] o texto respeita a seção 6 (OAB);
- [ ] a lista de TODOs de conteúdo pendente foi informada ao usuário.
