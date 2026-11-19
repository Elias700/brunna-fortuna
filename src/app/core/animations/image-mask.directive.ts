import { Directive, booleanAttribute, input, numberAttribute } from '@angular/core';

import { DELAY_REVEAL, DUR } from './motion-tokens';
import { revealOnEnter, useMotion } from './use-motion';

/**
 * Máscara de imagem com clip-path.
 * - `diagonal` R-SLIDE (`animateSlide`): polígono diagonal da direita até cobrir a moldura;
 *              o primeiro filho (a imagem) sai de scale 1.5 / xPercent 25 → 1 / 0.
 * - `wipe`     S-WIPE (`.img.loc-path`): revela da esquerda para a direita.
 *
 * O host deve ser a moldura (com dimensões reservadas no CSS para não gerar CLS).
 * Disparo único via IntersectionObserver (ver `revealOnEnter`).
 */
export type ImageMaskVariant = 'diagonal' | 'wipe';

@Directive({
  selector: '[appImageMask]',
  host: { 'data-anim': '', '[attr.data-after-intro]': 'afterIntro() ? "" : null' },
})
export class ImageMaskDirective {
  readonly variant = input<ImageMaskVariant, ImageMaskVariant | ''>('diagonal', {
    alias: 'appImageMask',
    transform: (v) => v || 'diagonal',
  });
  readonly maskDelay = input(DELAY_REVEAL, { transform: numberAttribute });
  readonly maskStart = input('top 85%');
  readonly afterIntro = input(false, { transform: booleanAttribute });

  constructor() {
    useMotion((scope) => {
      const { gsap, el, reduced, show } = scope;
      if (reduced) return show();
      const inner = el.firstElementChild as HTMLElement | null;

      return revealOnEnter(scope, { start: this.maskStart(), afterIntro: this.afterIntro() }, () => {
        const tl = gsap.timeline({ delay: this.maskDelay() });
        if (this.variant() === 'diagonal') {
          tl.fromTo(
            el,
            { clipPath: 'polygon(100% 0%, 100% 0%, 101% 100%, 125% 100%)' },
            { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: DUR.l, ease: 'InOut' },
          );
          if (inner) {
            tl.fromTo(inner, { scale: 1.5, xPercent: 25 }, { scale: 1, xPercent: 0, duration: DUR.l, ease: 'InOut' }, 0);
          }
        } else {
          tl.fromTo(
            el,
            { clipPath: 'inset(0% 100% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: DUR.l * 2, ease: 'Out', delay: DUR.m },
          );
        }
        show();
      });
    });
  }
}
