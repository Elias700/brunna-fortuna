import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { HeaderThemeService, MagneticDirective, ScrollAnimationService, useMotion } from '../../core/animations';
import { CTA_LABEL, NAV, PROFILE, type SectionId } from '../../core/data/site-content';
import { SectionNavService } from '../../core/navigation/section-nav.service';
import { RollTextComponent } from '../roll-text/roll-text.component';

const DESKTOP_NAV = '(min-width: 1180px)';

@Component({
  selector: 'app-header',
  imports: [NgOptimizedImage, RollTextComponent, MagneticDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-site-header': '',
    '[class.is-dark]': 'dark()',
    '[class.is-scrolled]': 'headerTheme.scrolled()',
    '[class.is-menu-open]': 'menuOpen()',
    '(document:keydown.escape)': 'close(true)',
  },
})
export class HeaderComponent {
  protected readonly headerTheme = inject(HeaderThemeService);
  protected readonly nav = inject(SectionNavService);
  private readonly anim = inject(ScrollAnimationService);

  protected readonly items = NAV;
  protected readonly cta = CTA_LABEL;
  protected readonly profile = PROFILE;

  protected readonly menuOpen = signal(false);
  /** O menu aberto tem fundo escuro; fora dele, o header segue o tema da seção atual. */
  protected readonly dark = computed(() => this.menuOpen() || this.headerTheme.theme() === 'dark');

  private readonly menuButton = viewChild.required<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly menu = viewChild.required<ElementRef<HTMLElement>>('menu');

  constructor() {
    // Header "rolado": ganha fundo sólido com blur (comportamento ao rolar, junto com H-THEME).
    useMotion(({ ScrollTrigger }) => {
      ScrollTrigger.create({
        start: 80,
        end: 'max',
        onToggle: (self) => this.headerTheme.scrolled.set(self.isActive),
        onRefresh: (self) => this.headerTheme.scrolled.set(self.isActive),
      });
    });

    // Fecha o menu se a tela crescer para o layout com navegação completa.
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const mql = window.matchMedia(DESKTOP_NAV);
      const onChange = (e: MediaQueryListEvent): void => {
        if (e.matches) this.close(false);
      };
      mql.addEventListener('change', onChange);
      destroyRef.onDestroy(() => {
        mql.removeEventListener('change', onChange);
        if (this.menuOpen()) this.anim.unlockScroll();
      });
    });
  }

  protected go(id: SectionId | 'topo', event: Event): void {
    this.close(false);
    this.nav.go(id, event);
  }

  protected toggle(): void {
    if (this.menuOpen()) {
      this.close(true);
      return;
    }
    this.menuOpen.set(true);
    this.anim.lockScroll();
    // Foco no primeiro link depois que o menu deixa de ser `inert`.
    queueMicrotask(() => requestAnimationFrame(() => this.focusables()[0]?.focus()));
  }

  protected close(restoreFocus: boolean): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.anim.unlockScroll();
    if (restoreFocus) this.menuButton().nativeElement.focus();
  }

  /** Mantém o foco dentro do menu (inclui o botão de fechar, que fica na barra). */
  protected trapFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.menuOpen()) return;
    const list = [this.menuButton().nativeElement, ...this.focusables()];
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusables(): HTMLElement[] {
    return Array.from(this.menu().nativeElement.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
  }
}
