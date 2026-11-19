import { Injectable, signal } from '@angular/core';

export type SectionTheme = 'light' | 'dark';

/**
 * Tema da seção que está sob o header (H-THEME do clone). Atualizado pela diretiva `appBgShift`.
 * O header lê `theme()` e troca as próprias cores.
 */
@Injectable({ providedIn: 'root' })
export class HeaderThemeService {
  readonly theme = signal<SectionTheme>('light');
  /** true depois que o usuário rola além do topo da página. */
  readonly scrolled = signal(false);
}
