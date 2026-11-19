// Arquivo gerado por scripts/optimize-images.mjs. Não edite à mão.

export interface ImageAsset {
  readonly width: number;
  readonly height: number;
  readonly widths: readonly number[];
}

export const IMAGES = {
  'brunna-hero': { width: 3072, height: 4096, widths: [480, 768, 1080, 1600] },
  'brunna-livros': { width: 3072, height: 4096, widths: [480, 768, 1080, 1600] },
  'brunna-retrato': { width: 3715, height: 4096, widths: [480, 768, 1080, 1600] },
  'brunna-palestras': { width: 1080, height: 1350, widths: [480, 768, 1080] },
  'brunna-horizontal': { width: 1440, height: 1113, widths: [480, 768, 1080, 1440] },
  'logo-gold': { width: 1277, height: 944, widths: [160, 320, 640] },
  'logo-ink': { width: 1277, height: 944, widths: [160, 320, 640] },
} as const satisfies Record<string, ImageAsset>;

export type ImageSlug = keyof typeof IMAGES;
