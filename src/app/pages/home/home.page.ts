import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { SITE } from '../../core/data/site-content';
import { homeJsonLd } from '../../core/seo/json-ld';
import { SeoService } from '../../core/seo/seo.service';
import { AboutComponent } from '../../sections/about/about.component';
import { ApproachComponent } from '../../sections/approach/approach.component';
import { ContactComponent } from '../../sections/contact/contact.component';
import { FaqComponent } from '../../sections/faq/faq.component';
import { HeroComponent } from '../../sections/hero/hero.component';
import { ManifestoComponent } from '../../sections/manifesto/manifesto.component';
import { PracticeAreasComponent } from '../../sections/practice-areas/practice-areas.component';
import { SpeakingComponent } from '../../sections/speaking/speaking.component';

/**
 * Página única. Ordem: Hero → Sobre → Manifesto → Atuação → Como atuo → Palestras → Dúvidas → Contato.
 * O manifesto (S-ZOOMIN) faz a ponte entre a fala pessoal do "Sobre" e o fundo escuro da "Atuação".
 *
 * Abaixo da dobra: `@defer (hydrate on idle)`. Com hidratação incremental, o servidor renderiza
 * todo o HTML (SEO intacto) e só o JS dessas seções fica num chunk separado, hidratado no idle.
 * O gatilho é `idle` e não `viewport` para que as áreas pinadas já tenham a altura certa antes de
 * o usuário chegar nelas (sem saltos).
 */
@Component({
  selector: 'app-home-page',
  imports: [
    HeroComponent,
    AboutComponent,
    ManifestoComponent,
    PracticeAreasComponent,
    ApproachComponent,
    SpeakingComponent,
    FaqComponent,
    ContactComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero />
    @defer (hydrate on idle) {
      <app-about />
      <app-manifesto />
      <app-practice-areas />
      <app-approach />
      <app-speaking />
      <app-faq />
      <app-contact />
    }
  `,
})
export class HomePage {
  constructor() {
    const seo = inject(SeoService);
    seo.apply({
      title: SITE.title,
      description: SITE.description,
      path: '/',
      jsonLd: homeJsonLd(seo.baseUrl),
    });
  }
}
