import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BgShiftDirective, PinSectionDirective, SplitTextDirective } from '../../core/animations';
import { MANIFESTO } from '../../core/data/site-content';

/** Manifesto entre "Sobre" e "Atuação". S-ZOOMIN (bloco cresce e aparece) + R-P nas linhas. */
@Component({
  selector: 'app-manifesto',
  imports: [NgOptimizedImage, BgShiftDirective, PinSectionDirective, SplitTextDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="manifesto" appPinSection="zoomIn" appBgShift="light">
      <figure class="manifesto__inner container-narrow" data-pin="content">
        <img class="manifesto__mark" ngSrc="logo-ink" width="64" height="47" alt="" />
        <p class="manifesto__text" appSplitText="lines">{{ text }}</p>
      </figure>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .manifesto {
      padding-block: var(--space-2xl);
      background: var(--c-sand);
      overflow: hidden;
    }
    .manifesto__inner {
      display: grid;
      justify-items: center;
      gap: var(--space-m);
      text-align: center;
    }
    .manifesto__mark {
      width: 3.5rem;
      height: auto;
      opacity: 0.85;
    }
    .manifesto__text {
      font-family: var(--font-serif);
      font-style: italic;
      font-weight: 300;
      font-size: clamp(1.75rem, 1.2rem + 2.4vw, 3.25rem);
      line-height: 1.2;
      color: var(--c-ink);
      text-wrap: balance;
    }
  `,
})
export class ManifestoComponent {
  protected readonly text = MANIFESTO.text;
}
