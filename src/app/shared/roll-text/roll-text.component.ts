import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TextRollDirective } from '../../core/animations';

/**
 * Texto com rolagem de letras no hover (H-NAVHOVER). O texto acessível fica num span
 * visualmente oculto; as duas cópias animadas têm aria-hidden.
 */
@Component({
  selector: 'app-roll-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [TextRollDirective],
  template: `
    <span class="visually-hidden">{{ text() }}</span>
    <span class="roll" aria-hidden="true">
      <span class="roll__copy" data-roll>{{ text() }}</span>
      <span class="roll__copy roll__copy--b" data-roll>{{ text() }}</span>
    </span>
  `,
  styles: `
    :host {
      display: inline-block;
    }
    .roll {
      position: relative;
      display: inline-grid;
      overflow: hidden;
      vertical-align: bottom;
      padding-block: 0.08em;
    }
    .roll__copy {
      grid-area: 1 / 1;
      white-space: nowrap;
    }
    .roll__copy--b {
      opacity: 0;
    }
  `,
})
export class RollTextComponent {
  readonly text = input.required<string>();
}
