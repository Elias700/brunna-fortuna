import { Directive, input } from '@angular/core';

import { useMotion } from './use-motion';

/**
 * Presets portados de `initAllParallax` / `.loc-w_bg_img` (docs/clone-analysis.md §3.2):
 * - `img`      P-IMG: imagem dentro de uma moldura com overflow oculto; yPercent −15 → 15 (com scale 1.3 para cobrir).
 * - `in`       P-IN:  imagem "assenta" ao entrar; yPercent −12 → 0.
 * - `out`      P-OUT: bloco "afunda" ao sair; yPercent 0 → 20.
 * - `ctnUp`    P-CTN: bloco sobe; yPercent 10 → −10.
 * - `ctnDown`  P-CTN: bloco desce; yPercent −10 → 10.
 * - `bgSettle` S-BGZOOM: fundo scale 1.15 → 1 enquanto a seção entra.
 *
 * Desligado abaixo de 768px e com movimento reduzido.
 * O gatilho é o ancestral `[data-parallax-wrap]` mais próximo ou, na falta dele, o elemento pai.
 */
export type ParallaxPreset = 'img' | 'in' | 'out' | 'ctnUp' | 'ctnDown' | 'bgSettle';

@Directive({ selector: '[appParallax]' })
export class ParallaxDirective {
  readonly preset = input<ParallaxPreset, ParallaxPreset | ''>('img', {
    alias: 'appParallax',
    transform: (v) => v || 'img',
  });

  constructor() {
    useMotion(({ gsap, el, tablet, reduced }) => {
      if (reduced || !tablet) return;
      const trigger = el.closest<HTMLElement>('[data-parallax-wrap]') ?? el.parentElement ?? el;

      switch (this.preset()) {
        case 'img':
          gsap.fromTo(
            el,
            { yPercent: -15, scale: 1.3 },
            {
              yPercent: 15,
              scale: 1.3,
              ease: 'none',
              scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
            },
          );
          break;
        case 'in':
          gsap.fromTo(
            el,
            { yPercent: -12, scale: 1.25 },
            {
              yPercent: 0,
              scale: 1.25,
              ease: 'none',
              scrollTrigger: { trigger, start: 'top bottom', end: 'bottom bottom', scrub: true },
            },
          );
          break;
        case 'out':
          gsap.fromTo(
            el,
            { yPercent: 0 },
            {
              yPercent: 20,
              ease: 'none',
              scrollTrigger: { trigger, start: 'bottom bottom', end: 'bottom top', scrub: 0.5 },
            },
          );
          break;
        case 'ctnUp':
        case 'ctnDown': {
          const dir = this.preset() === 'ctnUp' ? 1 : -1;
          gsap.fromTo(
            el,
            { yPercent: 10 * dir },
            {
              yPercent: -10 * dir,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top 125%', end: 'bottom -25%', scrub: 0.5 },
            },
          );
          break;
        }
        case 'bgSettle':
          gsap.from(el, {
            scale: 1.15,
            transformOrigin: 'center bottom',
            ease: 'Ease',
            scrollTrigger: { trigger, start: 'top bottom', end: 'bottom bottom', scrub: 0.25 },
          });
          break;
      }
    });
  }
}
