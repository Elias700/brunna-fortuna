import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  BgShiftDirective,
  ImageMaskDirective,
  ParallaxDirective,
  RevealDirective,
  SplitTextDirective,
} from '../../core/animations';
import { ABOUT } from '../../core/data/site-content';

/**
 * Sobre. Animações: R-SLIDE (máscara diagonal) + P-IMG na foto; R-H no título; R-P nos parágrafos;
 * R-LINE + R-CTN nas credenciais, com P-CTN (ritmo diferente) no desktop.
 */
@Component({
  selector: 'app-about',
  imports: [NgOptimizedImage, BgShiftDirective, ImageMaskDirective, ParallaxDirective, RevealDirective, SplitTextDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="sobre" class="about" aria-labelledby="about-title" appBgShift="light" tabindex="-1">
      <div class="container about__grid">
        <div class="about__media" data-parallax-wrap>
          <div class="about__frame" appImageMask="diagonal">
            <div class="about__mask-inner">
              <div class="about__parallax" appParallax="img">
                <img ngSrc="brunna-livros" fill sizes="(min-width: 992px) 42vw, 100vw" [alt]="about.photo.alt" />
              </div>
            </div>
          </div>
          <p class="about__caption" appReveal="fade" [revealDelay]="0.6">
            Especialista em Famílias e Sucessões
          </p>
        </div>

        <div class="about__content">
          <p class="eyebrow" appReveal="fade">{{ about.eyebrow }}</p>
          <h2 id="about-title" class="about__title" appSplitText="chars">{{ about.title }}</h2>

          <div class="about__text">
            @for (paragraph of about.paragraphs; track $index) {
              <p appSplitText="lines" [splitDelay]="0.2">{{ paragraph }}</p>
            }
          </div>

          <ul class="about__credentials" role="list" appParallax="ctnUp">
            @for (item of about.credentials; track item.title; let i = $index) {
              <li class="credential">
                <span class="credential__line" appReveal="line" [revealIndex]="i"></span>
                <div appReveal [revealIndex]="i">
                  <p class="credential__label">{{ item.label }}</p>
                  <h3 class="credential__title">{{ item.title }}</h3>
                  <p class="credential__detail">{{ item.detail }}</p>
                </div>
              </li>
            }
          </ul>
        </div>
      </div>
    </section>
  `,
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  protected readonly about = ABOUT;
}
