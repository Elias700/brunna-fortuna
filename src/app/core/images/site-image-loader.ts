import { IMAGE_CONFIG, IMAGE_LOADER, type ImageLoaderConfig } from '@angular/common';
import type { Provider } from '@angular/core';

import { IMAGES, type ImageSlug } from '../data/images.generated';

const BREAKPOINTS = [480, 768, 1080, 1440, 1600];

function isSlug(src: string): src is ImageSlug {
  return Object.prototype.hasOwnProperty.call(IMAGES, src);
}

/**
 * Loader do NgOptimizedImage para as imagens geradas por `npm run images`.
 * Uso: `<img ngSrc="brunna-hero" …>` → `/images/brunna-hero-<largura>.webp`.
 * A largura pedida é arredondada para a menor versão disponível que a cubra.
 */
export function siteImageLoader(config: ImageLoaderConfig): string {
  if (!isSlug(config.src)) return config.src;
  const { widths } = IMAGES[config.src];
  const width = config.width ? (widths.find((w) => w >= config.width!) ?? widths.at(-1)) : widths.at(-1);
  return `/images/${config.src}-${width}.webp`;
}

export function provideSiteImages(): Provider[] {
  return [
    { provide: IMAGE_LOADER, useValue: siteImageLoader },
    { provide: IMAGE_CONFIG, useValue: { breakpoints: BREAKPOINTS } },
  ];
}
