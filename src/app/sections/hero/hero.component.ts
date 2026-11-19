import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import {
  BgShiftDirective,
  MagneticDirective,
  PinSectionDirective,
  RevealDirective,
  SplitTextDirective,
  useMotion,
} from '../../core/animations';
import { HERO, PROFILE } from '../../core/data/site-content';
import { SectionNavService } from '../../core/navigation/section-nav.service';
import { IconComponent } from '../../shared/icon/icon.component';

/**
 * Hero. Animações (docs/clone-analysis.md §4):
 * - título: R-H (letras com rotateY) + R-A (destaque em itálico), depois da intro;
 * - subtítulo: R-P (linhas com máscara); CTAs e credenciais: R-CTN;
 * - foto: "assenta" (scale 1.08 → 1) quando a intro sai, como o hero do clone no fim do preloader.
 *   Não usa máscara de clip-path, para a foto pintar logo e servir de LCP;
 * - scroll: S-HERO (`heroDive`), em que o texto sobe e a foto dá zoom, só desktop.
 */
@Component({
  selector: 'app-hero',
  imports: [
    NgOptimizedImage,
    IconComponent,
    BgShiftDirective,
    MagneticDirective,
    PinSectionDirective,
    RevealDirective,
    SplitTextDirective,
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  protected readonly nav = inject(SectionNavService);
  protected readonly hero = HERO;
  protected readonly profile = PROFILE;
  protected readonly title = `${HERO.titleLead} ${HERO.titleAccent}`;

  constructor() {
    useMotion(({ gsap, el, reduced, service }) => {
      const img = el.querySelector<HTMLElement>('[data-hero-img]');
      if (reduced || !img) return;
      let alive = true;
      gsap.set(img, { scale: 1.08 });
      service.introDone.then(() => {
        if (!alive) return;
        if (service.introLate()) gsap.set(img, { scale: 1 });
        else gsap.to(img, { scale: 1, duration: 1.6, ease: 'Out' });
      });
      return () => {
        alive = false;
      };
    });
  }
}
