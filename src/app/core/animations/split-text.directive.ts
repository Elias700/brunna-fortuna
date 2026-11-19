import { Directive, booleanAttribute, input, numberAttribute } from '@angular/core';

import { DELAY_REVEAL, DUR, STAGGER } from './motion-tokens';
import { revealOnEnter, useMotion } from './use-motion';

/**
 * - `chars`      R-H: letras giram em Y e sobem (títulos).                    `animateTextH`
 * - `charsSlide` R-A: letras giram em X e deslizam na horizontal (destaques). `animateTextA`
 * - `lines`      R-P: linhas sobem dentro de uma máscara (parágrafos).        `animateTextP`
 * - `spread`     S-WORDS: palavras se afastam do centro conforme o scroll.    `.benefits-intro-w`
 *                (o clone anima `wordSpacing`, que muda o layout; aqui é só `x`)
 */
export type SplitMode = 'chars' | 'charsSlide' | 'lines' | 'spread';

/**
 * Animações de texto com SplitText. O HTML do SSR fica intacto. O split só acontece no browser,
 * quando o elemento entra na tela, e é desfeito (`revert`) ao fim da animação: o texto volta a ser
 * um nó simples (menos DOM, sem re-split no resize, leitura limpa por leitores de tela).
 */
@Directive({
  selector: '[appSplitText]',
  host: { 'data-anim': '', '[attr.data-after-intro]': 'afterIntro() ? "" : null' },
})
export class SplitTextDirective {
  readonly mode = input<SplitMode, SplitMode | ''>('lines', {
    alias: 'appSplitText',
    transform: (v) => v || 'lines',
  });
  readonly splitDelay = input(DELAY_REVEAL, { transform: numberAttribute });
  readonly splitStart = input('top 90%');
  readonly afterIntro = input(false, { transform: booleanAttribute });
  /**
   * Acessibilidade dos fragmentos durante a animação. `auto` (padrão nos modos por letra) põe
   * aria-label no host; use `hidden` quando o pai já tem o próprio aria-label (ex.: partes de um <h1>).
   */
  readonly splitAria = input<'auto' | 'hidden' | 'none'>();

  constructor() {
    useMotion((scope) => {
      const { gsap, SplitText, el, reduced, tablet, show } = scope;
      const mode = this.mode();

      if (mode === 'spread') {
        show();
        if (reduced || !tablet) return;
        const split = SplitText.create(el, { type: 'words', wordsClass: 'split-word', aria: 'auto' });
        const mid = (split.words.length - 1) / 2;
        gsap.fromTo(
          split.words,
          { x: 0 },
          {
            x: (i: number) => `${(i - mid) * 2}rem`,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
        return;
      }

      if (reduced) return show();

      return revealOnEnter(scope, { start: this.splitStart(), afterIntro: this.afterIntro() }, () => {
        const lines = mode === 'lines';
        const split = SplitText.create(el, {
          type: lines ? 'lines' : 'words,chars',
          mask: lines ? 'lines' : undefined,
          linesClass: 'split-line',
          wordsClass: 'split-word',
          charsClass: 'split-char',
          smartWrap: true,
          aria: this.splitAria() ?? (lines ? 'none' : 'auto'),
        });
        const done = (): void => split.revert();
        const delay = this.splitDelay();

        if (lines) {
          gsap.fromTo(
            split.lines,
            { yPercent: 110 },
            { yPercent: 0, duration: DUR.l, ease: 'Out', stagger: STAGGER, delay, onComplete: done },
          );
        } else {
          gsap.set(el, { perspective: 800 });
          const chars = split.chars;
          const each = Math.min(mode === 'chars' ? STAGGER / 2 : STAGGER, 1.1 / Math.max(chars.length, 1));
          const from =
            mode === 'chars'
              ? { opacity: 0, yPercent: 50, rotateY: 90 }
              : { opacity: 0, rotateX: 90, x: '0.6em', transformOrigin: 'center bottom' };
          gsap.fromTo(chars, from, {
            opacity: 1,
            yPercent: 0,
            rotateX: 0,
            rotateY: 0,
            x: 0,
            duration: DUR.l,
            ease: 'Out',
            stagger: each,
            delay,
            onComplete: done,
          });
        }
        show();
      });
    });
  }
}
