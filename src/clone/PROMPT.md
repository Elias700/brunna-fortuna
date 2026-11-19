# VibeCloner — Instruções para Reprodução

## Site original

| Campo | Valor |
|-------|-------|
| URL | https://www.era-residence.com/ |
| Título | ERA Residence — Contemporary Mediterranean Residences in Estepona |
| Capturado em | 2026-11-19T14:19:30.464Z |
| Tecnologias | Tailwind, Webflow, Smooth Scroll |

## Estrutura desta pasta

```
index.html            ← MIRROR rodável (HTML servido + JS). Rode: npx serve .
snapshot.html         ← fallback visual estático (DOM renderizado, sem JS)
mirror/               ← todos os recursos por host (js, css, fontes, imagens, mídia)
  <host>/...          ← estrutura de pastas idêntica à do original
screenshots/          ← 📸 REFERÊNCIA VISUAL — olhe aqui primeiro
DESIGN.md             ← 🎨 cores, tipografia e espaçamentos REAIS (computados)
PROMPT.md             ← este arquivo
```

## 📸 Screenshots (referência visual obrigatória)

A pasta `screenshots/` tem **16 imagems** mostrando cada seção da página como ela aparece no browser.

> **Sempre use essas imagens como referência fiel do design. Elas mostram o resultado final exato que deve ser reproduzido.**

## 🎨 Paleta (CSS custom properties extraídas)

```css
:root {
  --_colors---additional--success: #1ba64b;
  --_colors---additional--alert: #ffa800;
  --_colors---additional--error: #e23d3d;
  --_global-colors---brand-500--velvet-plum: #340c24;
  --_global-colors---base-0--100: #f3f3ec;
  --_global-colors---base-0--0: #f3f3ec00;
  --_global-colors---brand-500--powder-sky: #b5cedb;
  --_global-colors---brand-500--blush-bloom: #f8bbcb;
  --_global-colors---base-1000--100: #17233b;
  --_global-colors---base-1000--60: #17233b99;
  --_global-colors---base-1000--30: #17233b4d;
  --_global-colors---base-1000--10: #17233b1a;
  --_global-colors---base-1000--5: #17233b0d;
  --_global-colors---base-1000--0: #17233b00;
}
```

## ✒️ Fontes detectadas

- ambroise-francois-std
- sloop-script-three
- Maison Neue Extended

## 🎬 Mídias detectadas

- **8 vídeo(s)**

> Vídeos/áudios pequenos foram baixados para `assets/`; os maiores e os embeds (YouTube, etc.) mantêm a URL original no HTML. Reproduza os mesmos comportamentos (autoplay, loop, mudo) no clone.

## ✨ Efeitos de movimento

Bibliotecas de animação detectadas: **Smooth Scroll**.

2 animação(ões) `@keyframes` capturada(s) em `styles/keyframes.css`.

> O CSS de animações (`@keyframes`, `transition`, `transform`) foi capturado e funciona no clone. Animações controladas por JavaScript (scroll-reveal, parallax, timelines) não são copiadas como código — recrie-as usando as screenshots e estas bibliotecas como referência.

## ⚙️ Como este mirror funciona

Este é um **espelho completo e rodável**: o `index.html` é o HTML servido pelo original, com **todo o JavaScript, CSS, fontes e imagens preservados** e as URLs reescritas para os arquivos locais em `mirror/`. Rode com `npx serve .` — o site funciona igual ao original (menus, carrosséis, animações-JS, etc.).

> **Não abra por `file://`** — as URLs são absolutas a partir da raiz e precisam de um servidor local.
>
> `snapshot.html` é um fallback visual estático (sem JS), caso algum script dependa de API ao vivo. Bibliotecas detectadas: Tailwind, Webflow, Smooth Scroll.

## 🤖 Prompts prontos para Claude Code / Cursor

### ① Reproduzir exatamente igual
Abra esta pasta no Claude Code (`claude .`) e cole:

```
Tenho nesta pasta o clone de um site (https://www.era-residence.com/).

Quero que você reproduza este site exatamente igual ao original:

1. Rode o mirror com `npx serve .` e abra no navegador para ver o site funcionando
2. Leia o index.html para entender a estrutura completa (os recursos estão em /mirror/)
3. Analise as imagens em /screenshots/ — elas mostram como cada seção deve ficar visualmente
4. Use o DESIGN.md como fonte de verdade de cores, tipografia e espaçamentos (valores reais computados)
5. Mantenha todos os layouts, animações, hover effects e responsividade
6. Substitua apenas: textos de conteúdo, nome da marca e imagens de placeholder

Tecnologias do original: Tailwind, Webflow, Smooth Scroll
```

### ② Adaptar para o seu produto
```
Tenho nesta pasta o clone de https://www.era-residence.com/.

Adapte este site para o meu produto:
- Meu produto: [descreva aqui]
- Minha marca: [seu nome]
- Minhas cores: [suas cores]
- Meu público: [quem é seu cliente]

Mantenha toda a estrutura de layout, UX e hierarquia visual.
Use as screenshots em /screenshots/ para entender o que cada seção comunica.
Reescreva todos os textos para o meu contexto. Substitua as imagens por descrições do que colocar.
```

### ③ Publicar após personalizar
```bash
npx vercel        # deploy em 30 segundos
# ou
npx serve .       # testar localmente na porta 3000
```

---
*Gerado por VibeCloner*
