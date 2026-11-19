import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  BgShiftDirective,
  ImageMaskDirective,
  ParallaxDirective,
  RevealDirective,
  SplitTextDirective,
} from '../../core/animations';
import { APPROACH } from '../../core/data/site-content';

/**
 * Como atuo. Animações: S-WORDS (palavras do título se afastam com o scroll), S-WIPE + P-IN na foto,
 * R-CTN em stagger nos pilares, S-BGZOOM na marca d'água.
 */
@Component({
  selector: 'app-approach',
  imports: [NgOptimizedImage, BgShiftDirective, ImageMaskDirective, ParallaxDirective, RevealDirective, SplitTextDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="como-atuo" class="approach" aria-labelledby="approach-title" appBgShift="light" tabindex="-1">
      <div class="approach__head container">
        <p class="eyebrow" appReveal="fade">{{ approach.eyebrow }}</p>
        <h2 id="approach-title" class="approach__title" appSplitText="spread">{{ approach.title }}</h2>
        <p class="approach__intro" appSplitText="lines">{{ approach.intro }}</p>
      </div>

      <div class="approach__grid container">
        <div class="approach__media" data-parallax-wrap>
          <div class="approach__frame" appImageMask="wipe">
            <div class="approach__layer" appParallax="in">
              <img [ngSrc]="approach.photo.slug" fill sizes="(min-width: 992px) 36vw, 100vw" [alt]="approach.photo.alt" />
            </div>
          </div>
        </div>

        <ol class="approach__pillars" role="list">
          @for (pillar of approach.pillars; track pillar.title; let i = $index) {
            <li class="pillar" appReveal [revealIndex]="i % 2">
              <span class="pillar__num" aria-hidden="true">{{ '0' + (i + 1) }}</span>
              <h3 class="pillar__title">{{ pillar.title }}</h3>
              <p class="pillar__text">{{ pillar.text }}</p>
            </li>
          }
        </ol>
      </div>
    </section>
  `,
  styleUrl: './approach.component.scss',
})
export class ApproachComponent {
  protected readonly approach = APPROACH;
}
