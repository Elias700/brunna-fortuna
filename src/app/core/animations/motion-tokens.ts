/**
 * Constantes de movimento portadas do clone (docs/clone-analysis.md §2).
 * Mantenha em sincronia com as custom properties de src/styles/_tokens.scss.
 */

export const DUR = { s: 0.4, m: 0.8, l: 1.2 } as const;
export const STAGGER = 0.1;
export const DELAY_REVEAL = 0.3;

/** Breakpoints (px). `desktop` é o breakpoint do clone (992); `tablet` é o limite do AGENTS.md (768). */
export const BREAKPOINT = { tablet: 768, desktop: 992 } as const;

/**
 * Condições usadas em gsap.matchMedia(): as animações são recriadas quando qualquer uma muda.
 * `any` é sempre verdadeira. O GSAP só chama o setup quando ao menos uma condição bate, e sem ela
 * um celular comum (toque, < 768px, sem movimento reduzido) não bateria nenhuma e nada seria iniciado.
 */
export const MEDIA = {
  any: 'all',
  desktop: `(min-width: ${BREAKPOINT.desktop}px)`,
  tablet: `(min-width: ${BREAKPOINT.tablet}px)`,
  reduce: '(prefers-reduced-motion: reduce)',
  finePointer: '(hover: hover) and (pointer: fine)',
} as const;

export type MediaKey = keyof typeof MEDIA;

/** Easings do clone, registrados no GSAP via CustomEase com estes nomes. */
export const EASES = {
  InOut: '0.75,0,0.25,1',
  Out: '0.25,1,0.5,1',
  In: '0.5,0,0.75,0',
  Ease: '0.25,0.1,0.25,1',
  Write: '0.333,0,0.667,1',
  diveIn: '0.6,0,0,1',
  horScroll: '0.25,0,0.75,1',
} as const;

export type EaseName = keyof typeof EASES;

/** Configuração do Lenis idêntica à do clone. */
export const LENIS_OPTIONS = {
  duration: 1.2,
  smoothWheel: true,
  touchMultiplier: 2,
  easing: (t: number): number => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
} as const;
