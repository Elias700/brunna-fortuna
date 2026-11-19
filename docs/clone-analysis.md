# Análise do clone (Fase 0)

Referência de movimento: ERA Residence, espelhado em `src/clone` (vibecloner, capturado em 2026-11-19).
Este documento registra **apenas comportamento de movimento**. Nenhum texto, imagem, fonte, logo ou layout de marca do ERA será reaproveitado.

Fonte principal analisada: `src/clone/mirror/assets.slater.app/slater/20164/60900.qo531e0.js` (código próprio do site, 59 KB minificado, ~3.000 linhas formatado). O resto do JS é biblioteca de terceiros ou rastreamento.

---

## 1. Bibliotecas e versões

| Lib | Versão no clone | Uso no clone | Decisão para o projeto |
| --- | --- | --- | --- |
| GSAP core | 3.15 | Todas as animações | **Usar** (`gsap` via npm; desde a 3.13 todos os plugins são gratuitos, inclusive SplitText) |
| ScrollTrigger | 3.15 | Gatilhos, scrub, pin por sticky, `containerAnimation` | **Usar** |
| SplitText | 3.15 | Split em chars/words/lines com `mask` | **Usar** |
| CustomEase | 3.15 | 8 easings próprios (ver §2) | **Usar** (ou converter para `cubic-bezier` quando forem bezier simples) |
| Lenis | 1.3.21 | Smooth scroll global + instâncias locais | **Usar** (`lenis` via npm, MIT) |
| Barba.js | — | Transições entre páginas | **Não usar** (site de página única) |
| Lottie | 5.12.2 | Logo animado nos créditos | **Não usar** |
| Swiper | — | Carrossel de galeria | **Não usar** |
| jQuery + Webflow runtime | 3.5.1 | Infra do Webflow | **Não usar** |
| GTM, Facebook Pixel | — | Rastreamento | **Não usar** |

CSS: só 1 `@keyframes` (`spin`, do Webflow). Todo o movimento é JS (GSAP).

---

## 2. Constantes globais de movimento

```ts
breakPoint   = 992      // px; abaixo disso, comportamento "mobile"
durS         = 0.4      // s
durM         = 0.8
durL         = 1.2
stagger      = 0.1
delayReveal  = 0.3

// CustomEase (todos cubic-bezier, exceto loaderEase)
InOut     = cubic-bezier(0.75, 0, 0.25, 1)
Out       = cubic-bezier(0.25, 1, 0.5, 1)
In        = cubic-bezier(0.5, 0, 0.75, 0)
Ease      = cubic-bezier(0.25, 0.1, 0.25, 1)
Write     = cubic-bezier(0.333, 0, 0.667, 1)
diveIn    = cubic-bezier(0.6, 0, 0, 1)
horScroll = cubic-bezier(0.25, 0, 0.75, 1)
loaderEase = path SVG multiponto (progresso "hesitante" do loader)

// Lenis global
duration 1.2, smoothWheel true, touchMultiplier 2,
easing t => Math.min(1, 1.001 - 2^(-10t))   // expo-out
lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0)

// Outros
resize → debounce 40 ms → ScrollTrigger.refresh(true)
history.scrollRestoration = 'manual'
--_100svh = innerHeight (fixa altura de viewport no mobile)
```

Esses valores vão para `src/styles/_tokens.scss` (CSS) e para `src/app/core/animations/motion-tokens.ts` (TS).

---

## 3. Inventário de animações

Gatilho padrão dos reveals: `ScrollTrigger({ trigger: wrapper ?? el, start: 'top bottom', once: true })`. Itens com o mesmo `[data-scroll-reveal="w"]` animam juntos, com stagger pelo índice. O estado inicial é aplicado **via JS** (`"initial"`), então o HTML sem JS é legível. Esse é exatamente o comportamento que o AGENTS.md exige.

### 3.1 Reveals de texto e bloco (`animateText*`, `animateCtn`, `animateLine`, `animateSlide`)

| ID | Origem | O que faz | Duração / easing / stagger | Mobile |
| --- | --- | --- | --- | --- |
| R-A | `[data-scroll-reveal="a"]` (3×), `animateTextA` | SplitText **chars**; cada letra entra de `opacity 0, rotateX 90°, x 10rem` (origem embaixo) | durL, `Out`, stagger 0.1 + delay 0.3 | igual |
| R-H | `[data-scroll-reveal="h"]` (23×), `animateTextH` | SplitText **words+chars**; letras de `opacity 0, yPercent 50, rotateY 90°` | durL, `Out`, stagger 0.05 | igual |
| R-P | `[data-scroll-reveal="p"]` (55×), `animateTextP` | SplitText **lines** com `mask: 'lines'`; cada linha sobe de `yPercent 110` dentro da máscara | durL, `Out`, stagger 0.1 | igual |
| R-CTN | `[data-scroll-reveal="ctn"]` (20×), `animateCtn` | Bloco: `opacity 0, y 3.333rem` (desktop) / `11.54rem` (mobile) | durL, `Out`, stagger 0.1 | deslocamento maior |
| R-LINE | `[data-scroll-reveal="line"]` (7×), `animateLine` | Fio/divisor: `clip-path inset(0 0 100% 0)` → `inset(0)` | durL, `Out` | igual |
| R-SLIDE | `[data-scroll-reveal="slide"]` (13×), `animateSlide` | Máscara de imagem: `clip-path polygon` diagonal da direita → retângulo cheio; filho interno `scale 1.5, xPercent 25` → `1, 0` | durL, `InOut` | igual |

Cada função também tem um modo `"hide"` (saída inversa com durS, `In`, stagger/2). Ele é usado em sliders, abas, menu e em `onLeaveBack` de seções com scrub.

### 3.2 Parallax (`initAllParallax`)

| ID | Origem | Efeito | Trigger | Mobile |
| --- | --- | --- | --- | --- |
| P-IMG | `[data-parallax="img"]` dentro de `[data-parallax="w"]` | imagem `yPercent -15 → 15` | `top bottom` → fim, `scrub 0.5` | desligável por `data-mob="off"` |
| P-IN | `img-in` | `yPercent -20 → 0` (imagem "assenta" ao entrar) | `top bottom` → `bottom bottom`, `scrub true` | idem |
| P-OUT | `img-out` | `yPercent 0 → 20` (imagem "afunda" ao sair) | `bottom bottom` → `bottom top`, `scrub 0.5` | idem |
| P-CTN | `ctn-up` / `ctn-down` | bloco `yPercent ±10 → ∓10` | `top 125%` → `bottom -25%`, `scrub 0.5` | idem |

### 3.3 Sequências de seção (`initTranistionFlow`)

| ID | Origem | Comportamento | Detalhes |
| --- | --- | --- | --- |
| S-HERO | `.hero-scroll-area` | Área alta com hero sticky. Durante o scroll, o conteúdo sobe mais rápido que o fundo (`y` diferencial) e depois o fundo faz zoom `scale 1 → 2` (origem 50% 75%), um "mergulho" para a próxima seção | `start top top`, `end bottom bottom`, `scrub true`; mobile: só o zoom |
| S-WORDS | `.benefits-intro-w [data-circle-text]` | Título com palavras que se afastam (`wordSpacing 0 → 10rem`) conforme rola | scrub, `top bottom` → `bottom top` |
| S-ZOOMIN | `.loc-info-w` | Bloco central `opacity 0, scale 0.75 → 1` em scrub; ao entrar, reveals P/CTN; ao voltar, `hide` | `top 30%` → `bottom bottom`, `scrub 0.5` |
| S-HSCROLL | `.loc-scroll-area` | **Scroll horizontal pinado**: a altura da área vira `track.scrollWidth`, track `x: -(scrollWidth - width)` com ease `horScroll`. Linhas do título deslizam em direções opostas (`xPercent wrap([-5,25,-15]) → wrap([5,-25,25])`). Reveals internos usam `containerAnimation` | `2.5% top` → `97.5% bottom`, `scrub 0.25`; **só desktop (≥992px)** |
| S-WIPE | `.img.loc-path` | Imagem revelada da esquerda para a direita, `clip-path inset(0 100% 0 0) → inset(0)` | 2×durL, `Out`, delay durM, once |
| S-BGZOOM | `.loc-w_bg_img` | Fundo `scale 1.15 → 1` (origem embaixo) enquanto a seção entra | scrub 0.25 |
| S-ZOOMOUT | `.amen-scroll-area` | Saída em zoom: conteúdo `scale 1 → 2` + `opacity 1 → 0` | scrub, `In` |
| S-WINDOW | `.arch-scroll-area` | "Janela" que se abre: dois painéis com `clip-path polygon` recortando uma abertura que cresce; a cena dá zoom `1 → 1.84` e o conteúdo seguinte `0.75 → 1`; em 30% dispara reveals H/P; depois a imagem faz parallax `yPercent 25` | scrub, só desktop |
| S-FOOTER | `.footer-w` + `[data-footer-clip]` | A seção anterior encolhe por `clip-path inset(0) → inset(8% 22%)` (mobile `4% 32%`) enquanto o footer surge `opacity 0, scale 0.75 → 1`; reveals H/P/CTN no enter, `hide` no leave-back | `top 30%` → `bottom bottom`, `scrub 0.5` |

### 3.4 Intro / loader (`animatePreloaederIntro` / `Short`)

- Overlay com uma **abertura em arco** controlada por CSS vars `--arch-w` / `--arch-y`: `24vw/104vh` → `36vw/15vh` (1.25×durL, `InOut`) → `125/-100vh` (2×durL, `diveIn`), "atravessando" a abertura.
- Textos do loader com R-A/R-H/R-P/R-CTN/R-LINE; barra de progresso `yPercent -100 → 0` em 4s com `loaderEase`.
- Imagem do hero `scale 0.75 → 1` sincronizada com a saída do overlay.
- Scroll travado durante a intro. Com `sessionStorage.hasVisited`, roda a versão curta (sem textos, sem barra).
- Duração total da versão longa: ~7–8s.

### 3.5 Header, navegação e microinterações

| ID | Origem | Comportamento |
| --- | --- | --- |
| H-THEME | `[data-theme]` + seções `[data-bg="light/dark/color"]` | Cada elemento fixo do header troca de classe de tema (claro/escuro/cor) quando o **seu ponto central** cruza uma seção. Um ScrollTrigger por par elemento × seção. O header **não se esconde** ao rolar; ele muda de cor |
| H-LOGO | `.header-logo_bg` | Logo circular gira continuamente (30°/s) e acelera com a velocidade do Lenis |
| H-PROGRESS | `[data-s-bar]` | Barra lateral de progresso com número `00–100` e thumb arrastável. Só desktop |
| H-NAVHOVER | `[hover-nav-item]` | Texto duplicado: as letras do texto 1 sobem e somem enquanto as do texto 2 sobem de baixo, com stagger por posição horizontal (durM, `Ease`) |
| H-LINKHOVER | `[hover-link]` | Sublinhado por linha `scaleX 1 → 0` (origem à direita) e "flip" das letras com rotateY |
| H-MAGNETIC | `[data-magnetic-btn]` | Botão segue o cursor (força 25, `power4.out` 1.6s), volta com `elastic.out(1, 0.3)`. Só desktop |
| H-CIRCLE | `[hover-btn-circle]` | Arco SVG `stroke-dasharray` cresce de 4% para 50% no hover |
| H-MENU | `[data-modal-menu]` | Overlay em fade, ícone com duas barras que giram para formar X, conteúdo com R-A/R-H/R-P/R-CTN; Esc fecha; scroll travado |
| H-COOKIES | `[data-cookies]` | Card sobe `yPercent 100 → 0` com delay |

### 3.6 Componentes

| ID | Origem | Comportamento |
| --- | --- | --- |
| C-ACCORDION | `[data-accordion-card]` (17×) | Um aberto por vez; `height 0 → auto` (durL `Out`); ícone `+` gira −45°; conteúdo com R-P e R-CTN; `ScrollTrigger.refresh()` ao terminar |
| C-SLIDER / C-TABS | `[data-slider]`, `[data-tabs]` | Troca com saída `hide` + entrada `reveal` e R-SLIDE nas imagens; autoplay de 6s com barra de progresso |
| C-VIDEO | `[data-video-playpause]` | Vídeo toca só quando visível (`top bottom` → `bottom top`) |
| C-SNAP | `[data-snap]` | Snap de seções 40 ms após parar de rolar (desktop) |
| C-COUNTER | `[data-index]` | Numeração `1.0`, `2.0`… (estático, sem tween de contador) |

---

## 4. Mapeamento para o novo site

Diretivas em `src/app/core/animations/`, todas SSR-safe, com cleanup por `gsap.context().revert()` e respeitando `prefers-reduced-motion`.

| Animação do clone | Diretiva / serviço Angular | Seção do novo site | Adaptação |
| --- | --- | --- | --- |
| Constantes + eases + Lenis (§2) | `ScrollAnimationService` + `motion-tokens.ts` | global | Lenis desligado em reduced-motion; `lagSmoothing(0)`; refresh após `document.fonts.ready` e `load` |
| R-H (chars rotateY) | `appSplitText` `mode="chars"` | `<h1>` do hero, títulos `h2` de seção | Split só no browser; `aria-label` com o texto original e `aria-hidden` nos spans |
| R-A (chars rotateX + x) | `appSplitText` `mode="charsSlide"` | palavra de destaque do hero ("Famílias", "Sucessões") e nome no intro | uso pontual, porque é o mais "teatral" |
| R-P (lines masked) | `appSplitText` `mode="lines"` | parágrafos de todas as seções, respostas do FAQ | re-split no resize (debounce) |
| R-CTN | `appReveal` `type="up"` | cards, botões, listas, credenciais | deslocamento maior no mobile, como no clone |
| R-LINE | `appReveal` `type="line"` | fios divisórios, linha vertical do hero, separadores do FAQ | — |
| R-SLIDE | `appImageMask` `variant="diagonal"` | foto do hero, foto do "Sobre" | moldura interna com `scale 1.5 → 1` |
| S-WIPE | `appImageMask` `variant="wipe"` | foto da seção "Palestras" | — |
| P-IMG / P-IN / P-OUT | `appParallax` `preset="img" \| "in" \| "out"` | fotos do Sobre, Como atuo, Palestras | desligado < 768px e em reduced-motion |
| P-CTN | `appParallax` `preset="ctnUp" \| "ctnDown"` | blocos de credenciais (EPD / IBDFAM-BA) em ritmos diferentes | idem |
| S-HERO | `appPinSection` `variant="heroDive"` | Hero → Sobre | conteúdo sobe, foto dá zoom leve (**1 → 1.25**, não 2, para ficar sóbrio); só ≥ 992px |
| S-WORDS | `appSplitText` `mode="spread"` | intro de "Como atuo" (título cujas palavras se afastam) | troca `wordSpacing` (que causa layout) por `x` por palavra, só transform |
| S-ZOOMIN | `appPinSection` `variant="zoomIn"` | bloco-manifesto entre Sobre e Atuação ("Cada família tem a sua história…") | scale 0.85 → 1 + reveals |
| **S-HSCROLL** | `appHorizontalScroll` | **Áreas de atuação**: dois grupos (Famílias / Sucessões) num trilho horizontal pinado; título com linhas em direções opostas | padrão mais rico do clone, como o prompt pede; < 992px vira lista vertical com R-CTN em stagger |
| S-BGZOOM | `appParallax` `preset="bgSettle"` | fundo/foto de "Como atuo" | — |
| S-WINDOW (arco) | `appPinSection` `variant="window"` | Palestras e atuação institucional: a foto aparece por uma **abertura retangular** que cresce | troca o arco (motivo da marca ERA) por um retângulo com cantos suaves; só desktop |
| S-ZOOMOUT | `appPinSection` `variant="zoomOut"` | saída de Áreas de atuação para Como atuo | discreto: scale 1 → 1.15, opacity 1 → 0.4 |
| S-FOOTER | `appPinSection` `variant="footerClip"` | FAQ encolhe por `clip-path inset` e o bloco Contato + Footer surge | — |
| H-THEME | `appBgShift` (nas seções) + `HeaderThemeService` (signal) | header | seções marcam `data-bg="light \| dark"`; o header troca as cores. Comportamento ao rolar = troca de tema (igual ao clone) + fundo sólido com blur após sair do hero |
| H-NAVHOVER | `appTextRoll` | links do menu e CTAs | 2ª cópia do texto com `aria-hidden` |
| H-LINKHOVER | `appTextRoll` `underline` | links do footer e do contato | — |
| H-MAGNETIC | `appMagnetic` | CTA "Agendar conversa", botão do WhatsApp | só pointer fino, ≥ 992px |
| H-PROGRESS | `ScrollProgressComponent` (shared) | indicador lateral discreto `00–100` | sem arrastar (evita conflito com acessibilidade); `aria-hidden` |
| H-MENU | `MobileMenuComponent` | menu mobile | foco preso, Esc, `aria-expanded/controls`, reveals no conteúdo |
| C-ACCORDION | `FaqComponent` | FAQ | **sem animar `height`** (regra do AGENTS): grid `0fr → 1fr` é layout, então abre de imediato e o conteúdo entra com R-P/R-CTN (transform/opacity); ícone + gira −45° |
| Intro (§3.4) | `IntroComponent` (opcional) | entrada da página | versão **curta** (≤ 1.6s): monograma + abertura que cresce + hero `scale 0.9 → 1`. Só 1× por sessão, **sem travar o LCP** (o hero está no HTML; o overlay é só `clip-path` por cima). Desligado em reduced-motion |
| C-VIDEO | `appVideoInView` | só se o vídeo de `public/` for usado | play/pause por visibilidade |

**Não serão portados:** H-LOGO (logo girando: é assinatura visual do ERA e não combina com monograma), H-CIRCLE, C-SNAP (prejudica o controle do usuário e a acessibilidade), C-SLIDER/TABS (sem conteúdo que justifique), H-COOKIES (sem cookies não essenciais; se entrar analytics, reavaliar), Barba, Lottie, Swiper.

**Ajustes por regra do AGENTS.md:**

- `wordSpacing` e `height: auto` foram trocados por equivalentes em `transform`/`opacity`.
- Pins usam `position: sticky` com altura reservada no CSS (como no clone), sem `pin: true` do ScrollTrigger, para evitar CLS e pin-spacer.
- Abaixo de 768px: sem parallax, sem horizontal, sem window/zoom. Só reveals.
- Com `prefers-reduced-motion: reduce`: sem Lenis, sem scrub/pin/parallax/split; reveals viram fade de 0.3s ou nada.

---

## 5. Arquivos de `public/` e uso proposto

| Arquivo | Dimensões | Conteúdo | Uso proposto |
| --- | --- | --- | --- |
| `snapinsta-1795089649150.jpg` | 3072×4096, 1.0 MB | Brunna de blusa vinho, segurando pasta com o logo "Brunna Fortuna Advocacia", fundo claro e desfocado | **Hero** (LCP, `priority`). Sóbria, tem a marca, espaço negativo à esquerda |
| `snapinsta-1795089754674.jpg` | 3072×4096, 1.5 MB | Brunna no escritório, apoiada em livros de Direito de Família e Sucessões | **Sobre** (reforça a especialização) |
| `snapinsta-1795089602933.jpg` | 3715×4096, 2.0 MB | Retrato sorrindo, fundo cacau, blusa mostarda | **Como atuo** (acolhimento) |
| `snapinsta-1795091630135.jpg` | 1080×1350, 254 KB | Sentada com livro, fundo cacau | **Palestras / atuação institucional** |
| `snapinsta-1795089823137.jpg` | 1440×1113, 78 KB | Retrato horizontal, fundo de tijolo | **Contato** ou `og-image` (recorte 1200×630); resolução baixa para uso grande |
| `snapinsta-1795092225799.jpg` | 840×840, 47 KB | Monograma BF dourado sobre azul-marinho | apple-touch-icon / base de favicon; avatar no JSON-LD |
| `4d198e41-…png` | 1536×1024, 1.5 MB | Monograma BF dourado sobre preto, com brilho | intro/loader ou fundo decorativo escuro |
| `AQOU3X…mp4` | 10 MB | Vídeo (conteúdo não verificado: não há ffmpeg) | **pendente**: confirmar o conteúdo com a cliente |
| `favicon.ico` | — | Favicon padrão do Angular | substituir |

As fotos originais pesam 1–2 MB e têm até 4096px. O `NgOptimizedImage` não redimensiona sozinho sem um loader de CDN, então na Fase 1 vou gerar versões AVIF/WebP em 480/768/1080/1600 (script com `sharp` como devDependency) para o `srcset`.

**Paleta derivada do logo e das fotos:**

- azul-marinho do monograma ≈ `#0E1A2B`
- dourado escovado ≈ `#B8925A` (decorativo; texto só em fundo escuro)
- vinho da assinatura na pasta ≈ `#7A2E2E`
- off-white quente `#F6F1EA`
- areia `#E8DDCF`
- cacau dos fundos das fotos `#4A2E26`
- grafite para texto `#2A2A2E`

---

## 6. Pendências que dependem da cliente

1. **Logo em vetor (SVG) ou PNG com fundo transparente**, com monograma e assinatura "Brunna Fortuna Advocacia". Hoje só existem versões com fundo preto ou azul.
2. Conteúdo do vídeo `.mp4` e se ele deve entrar no site.
3. Dados de `site-content.ts`: OAB/UF nº, WhatsApp, e-mail, endereço/cidade, Instagram, LinkedIn, domínio, eventos e palestras.
4. Autorização de uso das imagens (são de Instagram, `snapinsta`): confirmar que a cliente tem os direitos das fotos.

---

## 7. Ajustes feitos na implementação (Fases 2–4)

Mudanças em relação ao plano acima, descobertas nos testes com navegador real:

| Item | Plano | Implementado | Motivo |
| --- | --- | --- | --- |
| Reveals de disparo único (R-CTN, R-LINE, R-P, R-H, R-A, R-SLIDE, S-WIPE) | ScrollTrigger `once` | `IntersectionObserver` + tween GSAP; SplitText só ao entrar na tela e `revert()` no fim | Dezenas de ScrollTriggers e splits na inicialização geravam tarefas longas de até 2,2 s (CPU 4×). ScrollTrigger ficou só onde há scrub/pin/horizontal |
| Estado inicial oculto | `visibility: hidden` | `opacity: 0` + `.anim-shown` + `:focus-within` | `visibility` tirava o conteúdo da árvore de acessibilidade e do Tab |
| Intro | Timeline GSAP | Keyframes CSS (o JS só registra o fim) | Em rede lenta, a intro esperava o bundle e segurava a tela azul por 3–4 s |
| Fail-safe do hero | — | Texto do hero aparece aos 1,8 s via CSS se o JS não chegou; os reveals são pulados (`introLate`) | Evita conteúdo oculto aguardando JS |
| Vídeo de palestra | Card com `<video preload="none">` | Facade (imagem lazy + botão); `<video>` só é criado no clique | O pôster era baixado no carregamento inicial; vídeo vertical, com áudio, sem autoplay |
| gsap.matchMedia | Condições desktop/tablet/reduce/finePointer | + condição `any: 'all'` | O GSAP só chama o setup se alguma condição bater; num celular comum nenhuma batia |
| Âncoras com Lenis | `offset: -header` | Sem offset (Lenis respeita `scroll-padding-top`) | Deslocamento ficava duplicado |
| Speaking (S-WINDOW) | Só desktop | Desktop com altura ≥ 720px | Palco fixo não cabia em janelas baixas |
