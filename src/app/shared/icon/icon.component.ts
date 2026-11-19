import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'arrow-right'
  | 'arrow-down'
  | 'arrow-up-right'
  | 'mail'
  | 'map-pin'
  | 'clock'
  | 'instagram'
  | 'linkedin'
  | 'whatsapp'
  | 'plus'
  | 'play'
  | 'pause';

/** Ícones de traço (24×24), decorativos por padrão (aria-hidden). */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', class: 'icon' },
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" [attr.stroke-width]="stroke()" stroke-linecap="round" stroke-linejoin="round" focusable="false">
      @switch (name()) {
        @case ('arrow-right') { <path d="M5 12h14M13 6l6 6-6 6" /> }
        @case ('arrow-down') { <path d="M12 5v14M6 13l6 6 6-6" /> }
        @case ('arrow-up-right') { <path d="M7 17 17 7M8 7h9v9" /> }
        @case ('mail') { <rect x="2.5" y="4.5" width="19" height="15" rx="2" /><path d="m22 7-10 6.5L2 7" /> }
        @case ('map-pin') { <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /> }
        @case ('clock') { <circle cx="12" cy="12" r="9.5" /><path d="M12 7v5l3.5 2" /> }
        @case ('instagram') { <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /> }
        @case ('linkedin') { <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" /><path d="M2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /> }
        @case ('whatsapp') {
          <path d="M3.5 20.5 4.9 16.6A8.6 8.6 0 1 1 8 19.4l-4.5 1.1Z" />
          <path d="M9.2 8.6c.2-.5.5-.6.8-.6h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.7l-.5.6c.6 1.2 1.6 2.1 2.8 2.7l.6-.6c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3-.1.6-.6.8-.8.4-2.2.5-4.2-.9-1.9-1.4-3-3-3.3-4.3-.2-.9 0-1.6.1-2Z" />
        }
        @case ('plus') { <path d="M12 5v14M5 12h14" /> }
        @case ('play') { <path d="M7 4.5v15l12-7.5-12-7.5Z" /> }
        @case ('pause') { <path d="M7 4.5v15M17 4.5v15" /> }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      width: 1.25em;
      height: 1.25em;
      flex: none;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly stroke = input(1.5);
}
