import { Directive, input, numberAttribute } from '@angular/core';

import { useMotion } from './use-motion';

/**
 * H-MAGNETIC (`initMagneticEffect`): o elemento segue levemente o cursor e volta com mola elástica.
 * Só desktop, com ponteiro fino e sem movimento reduzido.
 */
@Directive({ selector: '[appMagnetic]' })
export class MagneticDirective {
  /** Força em px de deslocamento máximo (o clone usa 25/16 em, ~25px). */
  readonly strength = input(18, { alias: 'appMagnetic', transform: (v: unknown) => numberAttribute(v, 18) });

  constructor() {
    useMotion(({ gsap, el, desktop, reduced, finePointer }) => {
      if (!desktop || reduced || !finePointer) return;
      const xTo = gsap.quickTo(el, 'x', { duration: 1.6, ease: 'power4.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 1.6, ease: 'power4.out' });

      const move = (e: PointerEvent): void => {
        const r = el.getBoundingClientRect();
        const s = this.strength();
        xTo(((e.clientX - r.left) / r.width - 0.5) * s);
        yTo(((e.clientY - r.top) / r.height - 0.5) * s);
      };
      const leave = (): void => {
        gsap.killTweensOf(el);
        gsap.to(el, { x: 0, y: 0, duration: 1.6, ease: 'elastic.out(1, 0.3)' });
      };

      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      return () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
      };
    });
  }
}
