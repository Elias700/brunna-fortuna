import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { SITE, isPending } from '../data/site-content';

export interface PageSeo {
  readonly title: string;
  readonly description: string;
  /** Caminho da página, ex.: '/' ou '/politica-de-privacidade'. */
  readonly path: string;
  /** Grafo JSON-LD (schema.org) da página. Omitido = remove o JSON-LD anterior. */
  readonly jsonLd?: Record<string, unknown>;
  readonly robots?: string;
}

const OG_IMAGE = { path: '/og-image.jpg', width: '1200', height: '630', alt: 'Brunna Fortuna Advocacia: Direito das Famílias e das Sucessões' };
const JSON_LD_ID = 'seo-jsonld';

/**
 * Metatags e dados estruturados, aplicados no SSR (vão no HTML pré-renderizado) e mantidos na navegação.
 * Enquanto o domínio for TODO, `canonical`/`og:url` não são emitidos (URL absoluta não pode ser inventada)
 * e a og:image fica com caminho relativo.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  /** URL de produção sem barra final, ou `null` se ainda pendente. */
  readonly baseUrl: string | null = isPending(SITE.url) ? null : SITE.url.replace(/\/$/, '');

  absolute(path: string): string {
    return this.baseUrl ? `${this.baseUrl}${path}` : path;
  }

  apply(page: PageSeo): void {
    const url = this.baseUrl ? this.absolute(page.path) : null;
    const image = this.absolute(OG_IMAGE.path);

    this.title.setTitle(page.title);
    this.setName('description', page.description);
    this.setName('robots', page.robots ?? 'index, follow, max-image-preview:large');
    this.setName('theme-color', '#0e1a2b');

    this.setProperty('og:type', 'website');
    this.setProperty('og:locale', SITE.locale);
    this.setProperty('og:site_name', 'Brunna Fortuna Advocacia');
    this.setProperty('og:title', page.title);
    this.setProperty('og:description', page.description);
    this.setProperty('og:image', image);
    this.setProperty('og:image:width', OG_IMAGE.width);
    this.setProperty('og:image:height', OG_IMAGE.height);
    this.setProperty('og:image:alt', OG_IMAGE.alt);
    if (url) this.setProperty('og:url', url);
    else this.meta.removeTag('property="og:url"');

    this.setName('twitter:card', 'summary_large_image');
    this.setName('twitter:title', page.title);
    this.setName('twitter:description', page.description);
    this.setName('twitter:image', image);
    this.setName('twitter:image:alt', OG_IMAGE.alt);

    this.setCanonical(url);
    this.setJsonLd(page.jsonLd);
  }

  private setName(name: string, content: string): void {
    this.meta.updateTag({ name, content }, `name="${name}"`);
  }

  private setProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content }, `property="${property}"`);
  }

  private setCanonical(url: string | null): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!url) {
      link?.remove();
      return;
    }
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /** Um único <script id="seo-jsonld"> no <head>, substituído (não duplicado) na hidratação e na navegação. */
  private setJsonLd(data: Record<string, unknown> | undefined): void {
    let script = this.document.getElementById(JSON_LD_ID);
    if (!data) {
      script?.remove();
      return;
    }
    if (!script) {
      script = this.document.createElement('script');
      script.id = JSON_LD_ID;
      script.setAttribute('type', 'application/ld+json');
      this.document.head.appendChild(script);
    }
    // Escapa "<" para impedir que um texto feche a tag <script>.
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
  }
}
