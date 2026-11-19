import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ScrollAnimationService } from '../animations';
import type { SectionId } from '../data/site-content';

/**
 * Navegação por âncoras com smooth scroll (Lenis), compensando o header fixo e movendo o foco
 * para a seção. Os links usam `href="/#id"`, então sem JS (ou fora da home) a âncora nativa funciona.
 */
@Injectable({ providedIn: 'root' })
export class SectionNavService {
  private readonly router = inject(Router);
  private readonly anim = inject(ScrollAnimationService);
  private readonly document = inject(DOCUMENT);

  href(id: SectionId | 'topo'): string {
    return id === 'topo' ? '/' : `/#${id}`;
  }

  /** Trata o clique. Devolve `false` quando a navegação nativa deve seguir. */
  go(id: SectionId | 'topo', event?: Event): boolean {
    if (!this.anim.isBrowser) return false;
    const path = this.router.url.split(/[?#]/)[0];
    if (path !== '/' && path !== '') return false;

    if (id === 'topo') {
      event?.preventDefault();
      const main = this.document.getElementById('conteudo');
      this.anim.scrollToElement(main ?? this.document.body, { focus: false });
      this.document.defaultView?.history.replaceState(null, '', '/');
      return true;
    }

    const target = this.document.getElementById(id);
    if (!target) return false;
    event?.preventDefault();
    this.anim.scrollToElement(target);
    this.document.defaultView?.history.replaceState(null, '', `#${id}`);
    return true;
  }
}
