import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  BgShiftDirective,
  HorizontalScrollDirective,
  PinSectionDirective,
  RevealDirective,
  SplitTextDirective,
} from '../../core/animations';
import { PRACTICE } from '../../core/data/site-content';

/**
 * Áreas de atuação. É o padrão mais rico do clone: S-HSCROLL (trilho horizontal pinado, linhas do título
 * em sentidos opostos, cards revelados pelo containerAnimation), seguido de S-ZOOMOUT na saída.
 * Abaixo de 992px ou com movimento reduzido, vira uma lista vertical com reveals simples.
 */
@Component({
  selector: 'app-practice-areas',
  imports: [BgShiftDirective, HorizontalScrollDirective, PinSectionDirective, RevealDirective, SplitTextDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './practice-areas.component.html',
  styleUrl: './practice-areas.component.scss',
})
export class PracticeAreasComponent {
  protected readonly practice = PRACTICE;

  protected num(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
