import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, NgZone, PLATFORM_ID, inject, signal } from '@angular/core';

import { DUR, EASES, LENIS_OPTIONS, MEDIA } from './motion-tokens';
import type { LenisInstance, MotionLib } from './motion-types';

/**
 * Núcleo das animações de scroll (port do clone, docs/clone-analysis.md).
 *
 * - Carrega GSAP, ScrollTrigger, SplitText, CustomEase e Lenis sob demanda, só no browser.
 * - Registra os easings do clone e cria o smooth scroll (Lenis) integrado ao ticker do GSAP.
 * - Tudo roda fora da zona do Angular.
 * - Com `prefers-reduced-motion: reduce`, o Lenis não é criado (e é destruído se a preferência mudar).
 */
@Injectable({ providedIn: 'root' })
export class ScrollAnimationService {
  private readonly zone = inject(NgZone);
  private readonly document = inject(DOCUMENT);
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Preferência do usuário por movimento reduzido (atualizada em tempo real). */
  readonly reducedMotion = signal(false);
  /** true quando a abertura (intro) terminou ou não vai acontecer. */
  readonly introFinished = signal(false);
  /**
   * true quando a intro (ou o fail-safe em CSS) já tinha acabado antes de o JS chegar: o texto do hero
   * já está visível, então os reveals com `afterIntro` são pulados para não piscar.
   */
  readonly introLate = signal(false);

  private libPromise?: Promise<MotionLib>;
  private lib?: MotionLib;
  private lenis: LenisInstance | null = null;
  private LenisCtor?: typeof import('lenis').default;
  private readonly lenisRaf = (time: number): void => this.lenis?.raf(time * 1000);
  private refreshTimer?: ReturnType<typeof setTimeout>;
  private lockCount = 0;

  private resolveIntro!: () => void;
  /** Resolve quando a intro termina. Elementos acima da dobra esperam por ela antes de animar. */
  readonly introDone: Promise<void> = new Promise<void>((resolve) => (this.resolveIntro = resolve));

  /** Carrega e inicializa as libs uma única vez. Rejeita no servidor. */
  load(): Promise<MotionLib> {
    if (!this.isBrowser) return Promise.reject(new Error('ScrollAnimationService: indisponível no servidor'));
    return (this.libPromise ??= this.init());
  }

  /** Marca a intro como concluída (chamado pelo IntroComponent ou quando a intro é pulada). */
  completeIntro(opts: { late?: boolean } = {}): void {
    if (opts.late) this.introLate.set(true);
    if (this.introFinished()) return;
    this.introFinished.set(true);
    this.resolveIntro();
  }

  /** Rola até um elemento compensando o header fixo e move o foco para ele (acessibilidade). */
  scrollToElement(target: HTMLElement, opts: { focus?: boolean } = {}): void {
    if (!this.isBrowser) return;
    const focus = (): void => {
      if (opts.focus === false) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };

    if (this.lenis) {
      // O Lenis já respeita o `scroll-padding-top` do <html> (= altura do header), então sem offset extra.
      this.lenis.scrollTo(target, { duration: DUR.l, onComplete: focus });
      return;
    }
    // Sem Lenis: `scroll-padding-top` (reset.scss) compensa o header.
    target.scrollIntoView({ behavior: this.reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    focus();
  }

  scrollToTop(): void {
    if (!this.isBrowser) return;
    if (this.lenis) this.lenis.scrollTo(0, { immediate: true, force: true });
    else this.document.defaultView?.scrollTo(0, 0);
  }

  /** Trava o scroll (menu mobile, intro). Chamadas aninhadas são contadas. */
  lockScroll(): void {
    if (!this.isBrowser || this.lockCount++ > 0) return;
    const html = this.document.documentElement;
    const win = this.document.defaultView!;
    html.style.setProperty('--scrollbar-width', `${win.innerWidth - html.clientWidth}px`);
    this.document.body.style.paddingRight = 'var(--scrollbar-width)';
    html.style.overflow = 'hidden';
    this.lenis?.stop();
  }

  unlockScroll(): void {
    if (!this.isBrowser || this.lockCount === 0 || --this.lockCount > 0) return;
    const html = this.document.documentElement;
    html.style.removeProperty('--scrollbar-width');
    this.document.body.style.paddingRight = '';
    html.style.overflow = '';
    this.lenis?.start();
  }

  /** Recalcula todos os gatilhos (debounce de 40 ms, como no clone). */
  refresh(): void {
    if (!this.lib) return;
    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => this.lib?.ScrollTrigger.refresh(), 40);
  }

  headerHeight(): number {
    const header = this.document.querySelector<HTMLElement>('[data-site-header]');
    return header?.getBoundingClientRect().height ?? 0;
  }

  private async init(): Promise<MotionLib> {
    const [{ gsap }, { ScrollTrigger }, { SplitText }, { CustomEase }, { default: Lenis }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('gsap/SplitText'),
      import('gsap/CustomEase'),
      import('lenis'),
    ]);

    gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
    for (const [name, curve] of Object.entries(EASES)) CustomEase.create(name, curve);

    const lib: MotionLib = { gsap, ScrollTrigger, SplitText };
    this.lib = lib;
    this.LenisCtor = Lenis;

    const win = this.document.defaultView!;
    const reduce = win.matchMedia(MEDIA.reduce);
    this.reducedMotion.set(reduce.matches);

    this.zone.runOutsideAngular(() => {
      win.history.scrollRestoration = 'manual';
      if (!reduce.matches) this.createLenis();

      reduce.addEventListener('change', (event) => {
        this.reducedMotion.set(event.matches);
        if (event.matches) this.destroyLenis();
        else this.createLenis();
        ScrollTrigger.refresh();
      });

      // Recalcula os gatilhos depois que fontes e imagens mudam as dimensões da página.
      this.document.fonts?.ready.then(() => ScrollTrigger.refresh());
      if (this.document.readyState !== 'complete') {
        win.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
      }
    });

    this.document.documentElement.classList.add('anim-ready');
    return lib;
  }

  private createLenis(): void {
    if (this.lenis || !this.lib || !this.LenisCtor) return;
    const { gsap, ScrollTrigger } = this.lib;
    this.lenis = new this.LenisCtor({ ...LENIS_OPTIONS, autoRaf: false });
    this.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(this.lenisRaf);
    gsap.ticker.lagSmoothing(0);
    if (this.lockCount > 0) this.lenis.stop();
  }

  private destroyLenis(): void {
    if (!this.lenis || !this.lib) return;
    this.lib.gsap.ticker.remove(this.lenisRaf);
    this.lenis.destroy();
    this.lenis = null;
  }
}
