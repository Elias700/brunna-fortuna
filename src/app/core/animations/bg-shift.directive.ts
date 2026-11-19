import { Directive, inject, input } from '@angular/core';

import { HeaderThemeService, type SectionTheme } from './header-theme.service';
import { useMotion } from './use-motion';

/**
 * H-THEME (`initThemeChange`): quando a linha central do header cruza esta seção, o header assume o tema dela.
 * Não é movimento, então também roda com movimento reduzido.
 *
 * @example <section appBgShift="dark">…</section>
 */
@Directive({
  selector: '[appBgShift]',
  host: { '[attr.data-bg]': 'theme()' },
})
export class BgShiftDirective {
  readonly theme = input.required<SectionTheme>({ alias: 'appBgShift' });
  private readonly headerTheme = inject(HeaderThemeService);

  constructor() {
    useMotion(({ ScrollTrigger, el, service }) => {
      const line = (): number => service.headerHeight() / 2;
      const apply = (active: boolean): void => {
        if (active) this.headerTheme.theme.set(this.theme());
      };
      ScrollTrigger.create({
        trigger: el,
        start: () => `top top+=${line()}`,
        end: () => `bottom top+=${line()}`,
        invalidateOnRefresh: true,
        onToggle: (self) => apply(self.isActive),
        onRefresh: (self) => apply(self.isActive),
      });
    });
  }
}
