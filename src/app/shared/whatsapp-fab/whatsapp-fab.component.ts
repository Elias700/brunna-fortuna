import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { MagneticDirective, useMotion } from '../../core/animations';
import { whatsappUrl } from '../../core/data/links';
import { SectionNavService } from '../../core/navigation/section-nav.service';
import { IconComponent } from '../icon/icon.component';

/**
 * Botão flutuante de WhatsApp, discreto, que aparece depois do hero.
 * Enquanto o número não for informado (TODO), leva para a seção de contato.
 */
@Component({
  selector: 'app-whatsapp-fab',
  imports: [IconComponent, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-visible]': 'visible()' },
  template: `
    @if (url; as href) {
      <a class="fab" [appMagnetic]="12" [href]="href" target="_blank" rel="noopener noreferrer" [attr.tabindex]="visible() ? null : -1">
        <app-icon name="whatsapp" [stroke]="1.6" />
        <span class="visually-hidden">Conversar pelo WhatsApp (abre em nova aba)</span>
      </a>
    } @else {
      <a class="fab" [appMagnetic]="12" [href]="nav.href('contato')" (click)="nav.go('contato', $event)" [attr.tabindex]="visible() ? null : -1">
        <app-icon name="whatsapp" [stroke]="1.6" />
        <span class="visually-hidden">Ir para o contato</span>
      </a>
    }
  `,
  styles: `
    @use 'mixins' as *;

    :host {
      position: fixed;
      right: max(var(--gutter), env(safe-area-inset-right));
      bottom: max(var(--gutter), env(safe-area-inset-bottom));
      z-index: var(--z-fab);
      opacity: 0;
      transform: translateY(1.5rem) scale(0.9);
      pointer-events: none;
      transition:
        opacity var(--dur-m) var(--ease-out),
        transform var(--dur-m) var(--ease-out);
    }
    :host(.is-visible) {
      opacity: 1;
      transform: none;
      pointer-events: auto;
    }
    .fab {
      display: grid;
      place-items: center;
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 50%;
      background: var(--c-ink);
      color: var(--c-gold-light);
      font-size: 1.4rem;
      box-shadow: var(--shadow-soft);
      border: 1px solid rgb(212 183 129 / 35%);
      transition: background-color var(--dur-s) var(--ease);

      @include hover {
        background: var(--c-wine);
        color: var(--c-paper);
      }
    }
  `,
})
export class WhatsappFabComponent {
  protected readonly nav = inject(SectionNavService);
  protected readonly url = whatsappUrl();
  protected readonly visible = signal(false);

  constructor() {
    useMotion(({ ScrollTrigger }) => {
      const hero = document.getElementById('inicio');
      ScrollTrigger.create({
        trigger: hero ?? document.body,
        start: hero ? 'bottom 60%' : 600,
        end: 'max',
        onToggle: (self) => this.visible.set(self.isActive),
        onRefresh: (self) => this.visible.set(self.isActive),
      });
    });
  }
}
