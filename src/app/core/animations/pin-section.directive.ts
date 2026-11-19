import { Directive, input } from '@angular/core';

import { DUR, STAGGER } from './motion-tokens';
import { useMotion } from './use-motion';

/**
 * Sequências de seção com scrub, portadas de `initTranistionFlow` (docs/clone-analysis.md §3.3).
 *
 * Variantes `window` e `footerClip` marcam o host com `data-pin-active` enquanto ativas; o CSS da seção
 * só aplica a área alta + palco sticky sob esse atributo (sem JS, o layout é estático).
 *
 * O "pin" é feito como no clone: o host é uma área alta e o palco interno usa `position: sticky`
 * (definido no CSS da seção, que também reserva a altura, sem CLS). A diretiva só cria as timelines.
 *
 * Filhos esperados (atributo `data-pin`):
 * - `heroDive`   S-HERO:     `content` sobe e esmaece; `media` dá zoom (1 → 1.2, origem 50% 75%). Só desktop.
 * - `zoomIn`     S-ZOOMIN:   `content` de scale 0.85 / opacity 0 → 1 enquanto o host entra. Tablet+.
 * - `zoomOut`    S-ZOOMOUT:  `content` (ou host) scale 1 → 1.08 / opacity 1 → 0.35 ao sair. Tablet+.
 * - `window`     S-WINDOW:   `media` abre de uma janela central (clip-path inset) até a tela cheia; a imagem
 *                            interna sai de scale 1.25 → 1; `content` aparece depois de 45% do percurso. Só desktop.
 * - `footerClip` S-FOOTER:   `media` encolhe por clip-path inset; `content` surge com scale 0.9 → 1. Tablet+.
 *
 * Fora das condições, os elementos ficam no estado final (visíveis, sem transform).
 */
export type PinVariant = 'heroDive' | 'zoomIn' | 'zoomOut' | 'window' | 'footerClip';

@Directive({ selector: '[appPinSection]' })
export class PinSectionDirective {
  readonly variant = input.required<PinVariant>({ alias: 'appPinSection' });

  constructor() {
    useMotion(({ gsap, ScrollTrigger, el, desktop, tablet, reduced }) => {
      if (reduced) return;
      const q = <T extends HTMLElement = HTMLElement>(name: string): T | null =>
        el.querySelector<T>(`[data-pin="${name}"]`);
      const content = q('content');
      const media = q('media');

      switch (this.variant()) {
        case 'heroDive': {
          if (!desktop) return;
          const tl = gsap.timeline({
            scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: true },
          });
          if (content) tl.fromTo(content, { y: 0, opacity: 1 }, { y: '-18vh', opacity: 0, ease: 'Ease', duration: 0.6 });
          if (media) {
            tl.fromTo(
              media,
              { scale: 1, transformOrigin: '50% 75%' },
              { scale: 1.2, ease: 'In', duration: 0.6 },
              content ? '-=0.45' : 0,
            );
          }
          return;
        }

        case 'zoomIn': {
          if (!tablet || !content) return;
          gsap.fromTo(
            content,
            { scale: 0.85, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top 85%', end: 'center 55%', scrub: 0.5 },
            },
          );
          return;
        }

        case 'zoomOut': {
          if (!tablet) return;
          gsap.fromTo(
            content ?? el,
            { scale: 1, opacity: 1 },
            {
              scale: 1.08,
              opacity: 0.35,
              ease: 'In',
              scrollTrigger: { trigger: el, start: 'bottom bottom', end: 'bottom top', scrub: true },
            },
          );
          return;
        }

        case 'window': {
          const parts = content ? Array.from(content.querySelectorAll<HTMLElement>('[data-pin-part]')) : [];
          // Sem espaço para o palco fixo (mobile/tablet ou janela baixa): cada parte faz um reveal simples.
          if (!desktop || window.innerHeight < 720 || !media) {
            parts.forEach((part) =>
              gsap.fromTo(
                part,
                { opacity: 0, y: 40 },
                {
                  opacity: 1,
                  y: 0,
                  duration: DUR.l,
                  ease: 'Out',
                  scrollTrigger: { trigger: part, start: 'top 90%', once: true },
                },
              ),
            );
            return;
          }
          el.dataset['pinActive'] = '';
          const img = media.firstElementChild as HTMLElement | null;
          const tl = gsap.timeline({
            scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: true },
          });
          tl.fromTo(
            media,
            { clipPath: 'inset(28% 34% 28% 34% round 10px)' },
            { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'InOut', duration: 0.6 },
          );
          if (img) tl.fromTo(img, { scale: 1.25 }, { scale: 1, ease: 'InOut', duration: 0.6 }, 0);
          tl.to({}, { duration: 0.4 });

          if (content) {
            const items = parts.length ? parts : [content];
            gsap.set(items, { opacity: 0, y: 40 });
            ScrollTrigger.create({
              trigger: el,
              start: '45% top',
              onEnter: () =>
                gsap.to(items, { opacity: 1, y: 0, duration: DUR.l, ease: 'Out', stagger: STAGGER, overwrite: true }),
              onLeaveBack: () =>
                gsap.to(items, { opacity: 0, y: 40, duration: DUR.s, ease: 'In', stagger: STAGGER / 2, overwrite: true }),
            });
          }
          return () => {
            delete el.dataset['pinActive'];
          };
        }

        case 'footerClip': {
          if (!tablet) return;
          el.dataset['pinActive'] = '';
          const tl = gsap.timeline({
            scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
          });
          if (media) {
            tl.fromTo(
              media,
              { clipPath: 'inset(0% 0% 0% 0% round 0px)' },
              { clipPath: desktop ? 'inset(8% 22% 8% 22% round 14px)' : 'inset(4% 8% 4% 8% round 10px)', ease: 'none' },
              0,
            );
          }
          if (content) tl.fromTo(content, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, ease: 'none' }, 0);
          return () => {
            delete el.dataset['pinActive'];
          };
        }
      }
    });
  }
}
