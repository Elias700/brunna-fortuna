import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BgShiftDirective, RevealDirective } from '../../core/animations';
import { socialLinks } from '../../core/data/links';
import { CONTACT, FOOTER, NAV, PROFILE, isPending, type SectionId } from '../../core/data/site-content';
import { SectionNavService } from '../../core/navigation/section-nav.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  imports: [NgOptimizedImage, RouterLink, IconComponent, BgShiftDirective, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'on-dark' },
  template: `
    <footer class="footer" appBgShift="dark">
      <div class="container footer__grid">
        <div class="footer__brand" appReveal>
          <img ngSrc="logo-gold" width="88" height="65" alt="" class="footer__logo" />
          <p class="footer__name">{{ profile.firmName }}</p>
          <p class="footer__tagline">{{ footer.tagline }}</p>
          <p class="footer__oab">
            {{ profile.name }} · <span [class.todo]="pending(profile.oab)">{{ profile.oab }}</span>
          </p>
        </div>

        <nav class="footer__col" aria-label="Links rápidos" appReveal [revealIndex]="1">
          <h2 class="footer__title">Navegação</h2>
          <ul role="list">
            @for (item of items; track item.id) {
              <li>
                <a [href]="nav.href(item.id)" (click)="go(item.id, $event)">{{ item.label }}</a>
              </li>
            }
          </ul>
        </nav>

        <div class="footer__col" appReveal [revealIndex]="2">
          <h2 class="footer__title">Contato</h2>
          <ul role="list">
            @if (!pending(contact.city)) {
              <li>{{ contact.city }}</li>
            }
            @if (!pending(contact.email)) {
              <li><a [href]="'mailto:' + contact.email">{{ contact.email }}</a></li>
            }
            @for (s of social; track s.url) {
              <li>
                <a [href]="s.url" target="_blank" rel="noopener noreferrer" class="footer__social">
                  <app-icon [name]="s.icon" /> {{ s.label }}
                  <span class="visually-hidden">(abre em nova aba)</span>
                </a>
              </li>
            }
            <li><a [href]="nav.href('contato')" (click)="go('contato', $event)">Formulário de contato</a></li>
          </ul>
        </div>
      </div>

      <div class="container footer__bottom">
        <p class="footer__legal">{{ footer.legal }}</p>
        <ul class="footer__policies" role="list">
          <li><a routerLink="/politica-de-privacidade">Política de privacidade</a></li>
          <li><a routerLink="/politica-de-privacidade" fragment="cookies">Cookies</a></li>
        </ul>
        <p class="footer__copy">© {{ year }} {{ profile.firmName }}. Todos os direitos reservados.</p>
      </div>
    </footer>
  `,
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  protected readonly nav = inject(SectionNavService);
  protected readonly items = NAV;
  protected readonly profile = PROFILE;
  protected readonly contact = CONTACT;
  protected readonly footer = FOOTER;
  protected readonly social = socialLinks();
  protected readonly year = new Date().getFullYear();
  protected readonly pending = isPending;

  protected go(id: SectionId, event: Event): void {
    this.nav.go(id, event);
  }
}
