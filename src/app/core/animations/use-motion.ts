import { DestroyRef, ElementRef, NgZone, afterNextRender, inject } from '@angular/core';

import { MEDIA, type MediaKey } from './motion-tokens';
import type { MatchMedia, MotionLib } from './motion-types';
import { ScrollAnimationService } from './scroll-animation.service';

export interface MotionScope extends MotionLib {
  readonly el: HTMLElement;
  readonly service: ScrollAnimationService;
  /** ≥ 992px */
  readonly desktop: boolean;
  /** ≥ 768px */
  readonly tablet: boolean;
  readonly reduced: boolean;
  readonly finePointer: boolean;
  /** Libera o host (o CSS o deixa com opacity 0 enquanto `html.js-anim` estiver ativo). */
  readonly show: () => void;
  /**
   * Executa `fn` registrando no contexto do matchMedia as animações e os SplitText criados nela.
   * Use em callbacks assíncronos (observers, promises), para que o revert no destroy também os desfaça.
   */
  readonly add: (fn: () => void) => void;
}

/** Função de setup. Pode devolver uma função de limpeza extra (listeners etc.). */
export type MotionSetup = (scope: MotionScope) => void | (() => void);

/**
 * Base de todas as diretivas de animação. Garante as regras da seção 4 do AGENTS.md:
 *  - só roda no browser (afterNextRender) e fora da zona do Angular;
 *  - cria tudo dentro de um gsap.matchMedia(), que é refeito quando o breakpoint ou a
 *    preferência de movimento muda e é revertido (ScrollTriggers, tweens, SplitText) no destroy;
 *  - se a lib falhar ao carregar, o conteúdo fica visível.
 *
 * Deve ser chamada num contexto de injeção (construtor ou inicializador de campo).
 */
export function useMotion(setup: MotionSetup): void {
  const service = inject(ScrollAnimationService);
  const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const zone = inject(NgZone);
  let mm: MatchMedia | undefined;
  let destroyed = false;

  inject(DestroyRef).onDestroy(() => {
    destroyed = true;
    mm?.revert();
  });

  afterNextRender(() => {
    service
      .load()
      .then((lib) => {
        if (destroyed) return;
        zone.runOutsideAngular(() => {
          mm = lib.gsap.matchMedia(el);
          mm.add(
            MEDIA,
            (context) => {
              const c = context.conditions as Record<MediaKey, boolean>;
              const show: MotionScope['show'] = () => el.classList.add('anim-shown');
              const add: MotionScope['add'] = (fn) => {
                context.add(fn);
              };
              const cleanup = setup({
                ...lib,
                el,
                service,
                desktop: c.desktop,
                tablet: c.tablet,
                reduced: c.reduce,
                finePointer: c.finePointer,
                show,
                add,
              });
              // Setups podem mudar a altura da página (áreas pinadas, scroll horizontal) e seções
              // hidratadas depois criam gatilhos novos: recalcula todos (debounce de 40 ms no serviço).
              service.refresh();
              return cleanup;
            },
            el,
          );
        });
      })
      .catch(() => {
        el.classList.add('anim-shown');
      });
  });
}

/** Converte um `start` no estilo ScrollTrigger ("top 90%") em rootMargin de IntersectionObserver. */
function toRootMargin(start: string): string {
  const match = /tops+(d+(?:.d+)?)%/.exec(start);
  const percent = match ? Number(match[1]) : 90;
  return `0px 0px -${Math.max(0, 100 - percent)}% 0px`;
}

/**
 * Reveal de disparo único com IntersectionObserver (em vez de ScrollTrigger): equivale a
 * `ScrollTrigger({ start, once: true })`, mas não entra no `refresh()` nem custa layout por gatilho.
 * O elemento fica oculto (`[data-anim]`) até entrar na tela; só então `play` monta o estado
 * inicial e anima. Com `afterIntro`, espera também o fim da intro.
 * Devolve a função de limpeza (desconecta o observer e cancela execuções pendentes).
 */
export function revealOnEnter(
  scope: Pick<MotionScope, 'el' | 'service' | 'add' | 'show'>,
  options: { start: string; afterIntro: boolean },
  play: () => void,
): () => void {
  let alive = true;
  const run = (): void => {
    if (alive) scope.add(play);
  };
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      if (options.afterIntro) {
        scope.service.introDone.then(() => (scope.service.introLate() ? scope.show() : run()));
      }
      else run();
    },
    { rootMargin: toRootMargin(options.start) },
  );
  observer.observe(scope.el);
  return () => {
    alive = false;
    observer.disconnect();
  };
}
