import { Directive } from '@angular/core';

import { DUR, STAGGER } from './motion-tokens';
import { useMotion } from './use-motion';

/**
 * S-HSCROLL (`.loc-scroll-area`, docs/clone-analysis.md §3.3): scroll horizontal pinado.
 *
 * Estrutura esperada:
 *   <div appHorizontalScroll>                ← área alta (altura definida aqui, só desktop)
 *     <div class="…stage">                    ← position: sticky; top: 0; height: 100svh (CSS da seção)
 *       <p data-hscroll="line">…</p>          ← linhas do título deslizam em sentidos opostos
 *       <div data-hscroll="track">            ← trilho (flex, sem quebra) que anda em X
 *         <article data-hscroll="item">…</article>
 *
 * Desktop (≥ 992px): o trilho percorre `scrollWidth − largura` com scrub 0.25. Os itens fazem
 * reveal pelo `containerAnimation`. Diferença em relação ao clone: o tween do trilho usa `ease: 'none'`,
 * obrigatório para `containerAnimation` calcular as posições certas.
 * Abaixo disso, ou com movimento reduzido, o CSS mostra uma lista vertical e os itens fazem um reveal simples.
 */
@Directive({ selector: '[appHorizontalScroll]' })
export class HorizontalScrollDirective {
  constructor() {
    useMotion(({ gsap, ScrollTrigger, el, desktop, reduced }) => {
      const track = el.querySelector<HTMLElement>('[data-hscroll="track"]');
      const items = Array.from(el.querySelectorAll<HTMLElement>('[data-hscroll="item"]'));
      const lines = Array.from(el.querySelectorAll<HTMLElement>('[data-hscroll="line"]'));
      if (!track || reduced) return;

      if (!desktop) {
        items.forEach((item) =>
          gsap.fromTo(
            item,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: DUR.l,
              ease: 'Out',
              scrollTrigger: { trigger: item, start: 'top 90%', once: true },
            },
          ),
        );
        return;
      }

      el.dataset['hscrollActive'] = '';
      const stage = (track.parentElement ?? el) as HTMLElement;
      const distance = (): number => Math.max(0, track.scrollWidth - stage.clientWidth);
      const setHeight = (): void => {
        el.style.height = `${distance() + window.innerHeight}px`;
      };
      setHeight();
      ScrollTrigger.addEventListener('refreshInit', setHeight);

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.25,
          invalidateOnRefresh: true,
        },
      });

      if (lines.length) {
        gsap.fromTo(
          lines,
          { xPercent: gsap.utils.wrap([-5, 18, -12]) },
          {
            xPercent: gsap.utils.wrap([5, -18, 12]),
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.25 },
          },
        );
      }

      items.forEach((item, i) =>
        gsap.fromTo(
          item,
          { opacity: 0, y: 48 },
          {
            opacity: 1,
            y: 0,
            duration: DUR.l,
            ease: 'Out',
            delay: (i % 2) * STAGGER,
            scrollTrigger: { trigger: item, containerAnimation: tween, start: 'left 92%', once: true },
          },
        ),
      );

      return () => {
        ScrollTrigger.removeEventListener('refreshInit', setHeight);
        el.style.height = '';
        delete el.dataset['hscrollActive'];
      };
    });
  }
}
