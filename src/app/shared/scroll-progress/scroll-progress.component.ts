import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';

import { HeaderThemeService, useMotion } from '../../core/animations';

/**
 * H-PROGRESS (`initScrollBar`): indicador lateral discreto de progresso (00–100), só desktop.
 * Puramente decorativo (aria-hidden). Atualiza o DOM direto, sem passar pela detecção de mudanças.
 */
@Component({
  selector: 'app-scroll-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[class.is-dark]': 'theme.theme() === "dark"' },
  template: `
    <span class="label" data-label>00</span>
    <span class="track"><span class="thumb"></span></span>
  `,
  styles: `
    :host {
      --progress: 0;
      position: fixed;
      left: calc(var(--gutter) * 0.75);
      top: 50%;
      z-index: var(--z-fab);
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      transform: translateY(-50%);
      color: var(--c-muted);
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      transition: color var(--dur-m) var(--ease);
      pointer-events: none;
    }
    :host(.is-dark) {
      color: var(--c-on-dark-muted);
    }
    @media (min-width: 1440px) {
      :host(.is-ready) {
        display: flex;
      }
    }
    .track {
      position: relative;
      width: 1px;
      height: 22vh;
      background: currentColor;
      opacity: 0.35;
    }
    .thumb {
      position: absolute;
      inset: 0 0 auto;
      height: 100%;
      background: currentColor;
      transform-origin: top;
      transform: scaleY(var(--progress));
    }
  `,
})
export class ScrollProgressComponent {
  protected readonly theme = inject(HeaderThemeService);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    useMotion(({ ScrollTrigger, desktop }) => {
      if (!desktop) return;
      host.classList.add('is-ready');
      const label = host.querySelector<HTMLElement>('[data-label]');
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          host.style.setProperty('--progress', self.progress.toFixed(4));
          if (label) label.textContent = String(Math.round(self.progress * 100)).padStart(2, '0');
        },
      });
      return () => host.classList.remove('is-ready');
    });
  }
}
