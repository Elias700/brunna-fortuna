import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { BgShiftDirective, PinSectionDirective } from '../../core/animations';
import { PROFILE, SPEAKING, isPending } from '../../core/data/site-content';
import { SectionNavService } from '../../core/navigation/section-nav.service';
import { IconComponent } from '../../shared/icon/icon.component';

/**
 * Palestras e atuação institucional. S-WINDOW (foto revelada por uma janela que se abre até a tela cheia,
 * com o texto entrando depois), só desktop. No mobile, foto e texto em sequência com reveals.
 * O vídeo (vertical, com áudio) só toca quando a pessoa pede: preload="none", controles nativos.
 */
@Component({
  selector: 'app-speaking',
  imports: [NgOptimizedImage, IconComponent, BgShiftDirective, PinSectionDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './speaking.component.html',
  styleUrl: './speaking.component.scss',
})
export class SpeakingComponent {
  protected readonly nav = inject(SectionNavService);
  protected readonly speaking = SPEAKING;
  protected readonly profile = PROFILE;
  protected readonly events = SPEAKING.events.filter((e) => !isPending(e.title));
  protected readonly captions = isPending(SPEAKING.video.captions) ? null : SPEAKING.video.captions;

  protected readonly playing = signal(false);
  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');

  constructor() {
    // Ao trocar o facade pelo <video>, o foco vai para o player e a reprodução começa
    // (o clique ainda conta como gesto do usuário, então o áudio é permitido).
    afterRenderEffect(() => {
      const el = this.video()?.nativeElement;
      if (!el) return;
      el.focus();
      el.play().catch(() => undefined);
    });
  }

  protected play(): void {
    this.playing.set(true);
  }
}
