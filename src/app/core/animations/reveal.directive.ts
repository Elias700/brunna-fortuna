import { Directive, booleanAttribute, input, numberAttribute } from '@angular/core';

import { DELAY_REVEAL, DUR, STAGGER } from './motion-tokens';
import { revealOnEnter, useMotion } from './use-motion';

export type RevealType = 'up' | 'line' | 'fade';

/**
 * Reveal de bloco ao entrar na viewport. Port de `animateCtn` (R-CTN) e `animateLine` (R-LINE).
 * Disparo único via IntersectionObserver (ver `revealOnEnter`).
 *
 * @example <div appReveal>…</div>
 * @example <ul appReveal revealChildren="li">…</ul>   (stagger entre os filhos)
 * @example <hr appReveal="line" />
 */
@Directive({
  selector: '[appReveal]',
  host: { 'data-anim': '', '[attr.data-after-intro]': 'afterIntro() ? "" : null' },
})
export class RevealDirective {
  readonly type = input<RevealType, RevealType | ''>('up', {
    alias: 'appReveal',
    transform: (v) => v || 'up',
  });
  readonly revealDelay = input(DELAY_REVEAL, { transform: numberAttribute });
  /** Posição no grupo: soma `index × stagger` ao delay (como os grupos `[data-scroll-reveal="w"]` do clone). */
  readonly revealIndex = input(0, { transform: numberAttribute });
  /** Seletor de filhos que recebem o stagger, em vez do próprio host. */
  readonly revealChildren = input<string>();
  readonly revealStart = input('top 90%');
  /** Espera a intro terminar (para elementos acima da dobra). */
  readonly afterIntro = input(false, { transform: booleanAttribute });

  constructor() {
    useMotion((scope) => {
      const { gsap, el, desktop, reduced, show } = scope;
      const selector = this.revealChildren();
      const targets = selector ? Array.from(el.querySelectorAll<HTMLElement>(selector)) : [el];
      if (reduced || targets.length === 0) return show();

      const type = this.type();
      const from =
        type === 'line'
          ? { clipPath: 'inset(0% 0% 100% 0%)' }
          : type === 'fade'
            ? { opacity: 0 }
            : { opacity: 0, y: desktop ? 48 : 40 };
      const to =
        type === 'line'
          ? { clipPath: 'inset(0% 0% 0% 0%)' }
          : type === 'fade'
            ? { opacity: 1 }
            : { opacity: 1, y: 0 };

      return revealOnEnter(scope, { start: this.revealStart(), afterIntro: this.afterIntro() }, () => {
        gsap.fromTo(targets, from, {
          ...to,
          duration: DUR.l,
          ease: 'Out',
          delay: this.revealDelay() + this.revealIndex() * STAGGER,
          stagger: STAGGER,
        });
        show();
      });
    });
  }
}
