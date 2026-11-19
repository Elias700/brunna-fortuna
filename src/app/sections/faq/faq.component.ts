import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { BgShiftDirective, RevealDirective, SplitTextDirective } from '../../core/animations';
import { FAQ } from '../../core/data/site-content';
import { SectionNavService } from '../../core/navigation/section-nav.service';
import { IconComponent } from '../../shared/icon/icon.component';

/**
 * FAQ em acordeão acessível (C-ACCORDION do clone: um item aberto por vez, ícone + gira −45°).
 * Diferença: não anima `height` (regra do AGENTS.md). O painel abre de imediato e o texto entra com
 * fade/translate. Os painéis fechados usam `hidden="until-found"`, então a busca da página (Ctrl+F)
 * encontra e abre as respostas. O conteúdo está todo no HTML do SSR (e no JSON-LD FAQPage).
 */
@Component({
  selector: 'app-faq',
  imports: [IconComponent, BgShiftDirective, RevealDirective, SplitTextDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="duvidas" class="faq" aria-labelledby="faq-title" appBgShift="light" tabindex="-1">
      <div class="container faq__grid">
        <div class="faq__intro">
          <p class="eyebrow" appReveal="fade">{{ faq.eyebrow }}</p>
          <h2 id="faq-title" class="faq__title" appSplitText="chars">{{ faq.title }}</h2>
          <p class="faq__disclaimer" appReveal [revealIndex]="1">{{ faq.disclaimer }}</p>
          <p class="faq__more" appReveal [revealIndex]="2">
            Não encontrou a sua dúvida?
            <a class="text-link" [href]="nav.href('contato')" (click)="nav.go('contato', $event)">Envie uma mensagem</a>.
          </p>
        </div>

        <div class="faq__list" appReveal revealChildren=".faq__item" [revealDelay]="0.1">
          @for (item of faq.items; track item.question; let i = $index) {
            <div class="faq__item" [class.is-open]="open() === i">
              <h3 class="faq__q">
                <button
                  type="button"
                  class="faq__button"
                  [id]="'faq-btn-' + i"
                  [attr.aria-expanded]="open() === i"
                  [attr.aria-controls]="'faq-panel-' + i"
                  (click)="toggle(i)"
                >
                  <span>{{ item.question }}</span>
                  <app-icon class="faq__icon" name="plus" />
                </button>
              </h3>
              <div
                class="faq__a"
                role="region"
                [id]="'faq-panel-' + i"
                [attr.aria-labelledby]="'faq-btn-' + i"
                [attr.hidden]="open() === i ? null : 'until-found'"
                (beforematch)="open.set(i)"
              >
                <p>{{ item.answer }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  protected readonly nav = inject(SectionNavService);
  protected readonly faq = FAQ;
  protected readonly open = signal<number | null>(0);

  protected toggle(i: number): void {
    this.open.update((current) => (current === i ? null : i));
  }
}
