import { Directive } from '@angular/core';

import { DUR, STAGGER } from './motion-tokens';
import { useMotion } from './use-motion';

/**
 * H-NAVHOVER (`initNavItemHover`): no hover, as letras da 1ª cópia sobem e somem enquanto as da 2ª
 * sobem de baixo, com stagger pela posição horizontal.
 *
 * O host precisa de duas cópias visuais `[data-roll]` (ambas com aria-hidden) e de um texto
 * acessível separado. Use o componente `<app-roll-text>`, que monta essa estrutura.
 * O gatilho é o link ou botão ancestral mais próximo. Só com ponteiro fino e sem movimento reduzido.
 */
@Directive({ selector: '[appTextRoll]' })
export class TextRollDirective {
  constructor() {
    useMotion(({ gsap, SplitText, el, reduced, finePointer }) => {
      if (reduced || !finePointer) return;
      const copies = el.querySelectorAll<HTMLElement>('[data-roll]');
      if (copies.length < 2) return;

      const opts = { type: 'chars', charsClass: 'split-char', aria: 'none' as const, smartWrap: true };
      const a = SplitText.create(copies[0], opts);
      const b = SplitText.create(copies[1], opts);

      const byPosition = (amount: number) => (i: number, _t: Element, list: Element[]) => {
        const xs = list.map((c) => c.getBoundingClientRect().left);
        const min = Math.min(...xs);
        const span = Math.max(...xs) - min || 1;
        return ((xs[i] - min) / span) * amount;
      };
      const stagger = byPosition(STAGGER * 2);
      const base = { duration: DUR.m, ease: 'Ease', overwrite: true, force3D: true };

      gsap.set(b.chars, { yPercent: 100, opacity: 0 });
      // A 2ª cópia começa invisível no CSS (para toque/sem JS); aqui ela passa a ser controlada pelas letras.
      gsap.set(copies[1], { opacity: 1 });

      const enter = (): void => {
        gsap.to(a.chars, { ...base, yPercent: -100, opacity: 0, stagger });
        gsap.to(b.chars, { ...base, yPercent: 0, opacity: 1, stagger });
      };
      const leave = (): void => {
        gsap.to(a.chars, { ...base, yPercent: 0, opacity: 1, stagger });
        gsap.to(b.chars, { ...base, yPercent: 100, opacity: 0, stagger });
      };

      const trigger = el.closest<HTMLElement>('a, button') ?? el;
      trigger.addEventListener('mouseenter', enter);
      trigger.addEventListener('mouseleave', leave);
      return () => {
        trigger.removeEventListener('mouseenter', enter);
        trigger.removeEventListener('mouseleave', leave);
      };
    });
  }
}
