import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ScrollAnimationService } from './core/animations';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { IntroComponent } from './shared/intro/intro.component';
import { ScrollProgressComponent } from './shared/scroll-progress/scroll-progress.component';
import { WhatsappFabComponent } from './shared/whatsapp-fab/whatsapp-fab.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IntroComponent, HeaderComponent, FooterComponent, WhatsappFabComponent, ScrollProgressComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#conteudo" (click)="skipToContent($event)">Pular para o conteúdo</a>
    <app-intro />
    <app-header />
    <main id="conteudo" tabindex="-1">
      <router-outlet />
    </main>
    <!-- Hidratação incremental: o HTML vem completo do SSR; o JS destes blocos espera. -->
    @defer (hydrate on viewport) {
      <app-footer />
    }
    @defer (hydrate on idle) {
      <app-whatsapp-fab />
      <app-scroll-progress />
    }
  `,
  styles: `
    main:focus {
      outline: none;
    }
  `,
})
export class App {
  private readonly anim = inject(ScrollAnimationService);

  /** Com `<base href="/">`, um `#conteudo` puro levaria à home fora dela; aqui o foco vai direto ao <main>. */
  protected skipToContent(event: Event): void {
    const main = document.getElementById('conteudo');
    if (!main) return;
    event.preventDefault();
    main.focus({ preventScroll: true });
    this.anim.scrollToElement(main, { focus: false });
  }
}
