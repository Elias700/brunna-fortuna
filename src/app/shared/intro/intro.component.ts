import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, inject } from '@angular/core';

import { ScrollAnimationService } from '../../core/animations';

export const INTRO_STORAGE_KEY = 'bf-intro-seen';

/**
 * Abertura curta (~1,65 s) com o monograma. Adaptação do preloader do clone (docs/clone-analysis.md §3.4):
 * monograma e linha de progresso entram; o painel sobe como uma cortina (ease `diveIn`) e libera o hero.
 *
 * - A animação é 100% CSS (intro.component.scss): começa na primeira pintura e não espera o JS.
 *   Em rede lenta, a intro termina mesmo que o bundle ainda não tenha chegado.
 * - Uma vez por sessão (sessionStorage). O script inline em index.html adiciona `html.intro-pending`
 *   antes da primeira pintura; sem JS ou com movimento reduzido, a intro não aparece.
 * - Aqui o JS só aguarda o fim das animações CSS e avisa o serviço (`completeIntro`), que libera os
 *   reveals do hero. Se a intro já tinha acabado quando o JS chegou, os reveals do hero são pulados
 *   (o fail-safe em CSS já mostrou o texto).
 * - É decorativa (aria-hidden). O conteúdo do hero está no HTML e não depende dela.
 */
@Component({
  selector: 'app-intro',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <div class="intro" data-intro>
      <div class="intro__center">
        <img class="intro__logo" ngSrc="logo-gold" ngSrcset="160w, 320w" sizes="(min-width: 768px) 168px, 104px" width="168" height="124" alt="" loading="eager" />
        <span class="intro__line"><span></span></span>
        <span class="intro__name">Brunna Fortuna · Advocacia</span>
      </div>
    </div>
  `,
  styleUrl: './intro.component.scss',
})
export class IntroComponent {
  private readonly anim = inject(ScrollAnimationService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    afterNextRender(() => {
      const html = document.documentElement;
      if (!html.classList.contains('intro-pending')) {
        // Sem intro, ou o fail-safe do index.html já a removeu (JS muito lento).
        this.anim.completeIntro({ late: !html.classList.contains('anim-ready') && performance.now() > 1700 });
        return;
      }

      const root = this.host.querySelector<HTMLElement>('[data-intro]');
      const animations = root?.getAnimations({ subtree: true }) ?? [];
      const running = animations.filter((a) => a.playState !== 'finished');
      const late = running.length === 0;

      const finish = (): void => {
        html.classList.remove('intro-pending');
        this.anim.completeIntro({ late });
        try {
          sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
        } catch {
          /* storage indisponível: a intro pode repetir, sem prejuízo */
        }
      };

      if (late) {
        finish();
        return;
      }

      // Libera os reveals do hero quando a cortina começa a subir (≈ 1,0 s), como no clone.
      const curtain = root?.getAnimations().find((a) => (a as CSSAnimation).animationName?.includes('intro-curtain'));
      const releaseAt = 1000 - (Number(curtain?.currentTime) || 0);
      setTimeout(() => this.anim.completeIntro({ late: false }), Math.max(0, releaseAt));
      Promise.all(running.map((a) => a.finished))
        .catch(() => undefined)
        .then(finish);
    });
  }
}
