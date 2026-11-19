/**
 * Gera as versões otimizadas das imagens a partir de `media-src/` (originais, fora do build).
 *
 * Saídas:
 *  - public/images/<slug>-<largura>.webp      fotos responsivas
 *  - public/images/logo-*.webp                monograma (dourado original e versão chapada em tinta)
 *  - public/media/palestra.mp4                vídeo (cópia)
 *  - src/app/core/data/images.generated.ts    manifesto tipado (dimensões e larguras disponíveis)
 *
 * Também gera favicon.ico/.svg, apple-touch-icon, ícones do manifest (public/icons) e og-image.jpg.
 *
 * Uso: npm run images
 */
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'media-src');
const OUT = path.join(ROOT, 'public', 'images');
const MEDIA_OUT = path.join(ROOT, 'public', 'media');
const MANIFEST = path.join(ROOT, 'src', 'app', 'core', 'data', 'images.generated.ts');

/** Larguras usadas no srcset. O loader do NgOptimizedImage arredonda para a mais próxima acima. */
const WIDTHS = [480, 768, 1080, 1600];
const QUALITY = 74;

const PHOTOS = [
  { slug: 'brunna-hero', file: 'snapinsta-1795089649150.jpg' },
  { slug: 'brunna-livros', file: 'snapinsta-1795089754674.jpg' },
  { slug: 'brunna-retrato', file: 'snapinsta-1795089602933.jpg' },
  { slug: 'brunna-palestras', file: 'snapinsta-1795091630135.jpg' },
  { slug: 'brunna-horizontal', file: 'snapinsta-1795089823137.jpg' },
];

const LOGO_FILE = 'fundo-tranparente.png';
const LOGO_WIDTHS = [160, 320, 640];
/** Cor "tinta" (azul-marinho do monograma) para usar o logo sobre fundo claro. */
const INK = { r: 14, g: 26, b: 43 };

async function photo({ slug, file }) {
  const input = path.join(SRC, file);
  const meta = await sharp(input).rotate().metadata();
  const sourceWidth = meta.autoOrient?.width ?? meta.width;
  const sourceHeight = meta.autoOrient?.height ?? meta.height;
  const widths = WIDTHS.filter((w) => w <= sourceWidth);
  if (!widths.includes(sourceWidth) && sourceWidth < WIDTHS.at(-1)) widths.push(sourceWidth);

  for (const w of widths) {
    await sharp(input)
      .rotate()
      .resize({ width: w })
      .webp({ quality: QUALITY, effort: 5 })
      .toFile(path.join(OUT, `${slug}-${w}.webp`));
  }
  return { slug, width: sourceWidth, height: sourceHeight, widths };
}

async function logo() {
  const input = path.join(SRC, LOGO_FILE);
  const trimmed = await sharp(input).trim({ threshold: 1 }).png().toBuffer();
  const { width, height } = await sharp(trimmed).metadata();

  const alpha = await sharp(trimmed).extractChannel('alpha').toBuffer();
  const ink = await sharp({ create: { width, height, channels: 3, background: INK } })
    .joinChannel(alpha)
    .png()
    .toBuffer();

  for (const w of LOGO_WIDTHS) {
    await sharp(trimmed).resize({ width: w }).webp({ quality: 88, alphaQuality: 90 }).toFile(path.join(OUT, `logo-gold-${w}.webp`));
    await sharp(ink).resize({ width: w }).webp({ quality: 88, alphaQuality: 90 }).toFile(path.join(OUT, `logo-ink-${w}.webp`));
  }
  return [
    { slug: 'logo-gold', width, height, widths: LOGO_WIDTHS },
    { slug: 'logo-ink', width, height, widths: LOGO_WIDTHS },
  ];
}

// ─── Favicons e og-image ─────────────────────────────────────────────────────
const PUBLIC = path.join(ROOT, 'public');
const NAVY = { r: 14, g: 26, b: 43, alpha: 1 };

/** Monograma dourado centralizado num quadrado azul-marinho (ícones do app). `pad` = margem relativa. */
async function brandSquare(size, pad = 0.18, radius = 0) {
  const trimmed = await sharp(path.join(SRC, LOGO_FILE)).trim({ threshold: 1 }).png().toBuffer();
  const inner = Math.round(size * (1 - pad * 2));
  const mark = await sharp(trimmed).resize({ width: inner, height: inner, fit: 'inside' }).toBuffer();
  const base = sharp({ create: { width: size, height: size, channels: 4, background: NAVY } }).composite([
    { input: mark, gravity: 'center' },
  ]);
  if (!radius) return base.png().toBuffer();
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#fff"/></svg>`);
  return sharp(await base.png().toBuffer()).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
}

/** ICO com imagens PNG embutidas (formato aceito por todos os navegadores atuais). */
function toIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const dir = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...dir, ...pngs.map((p) => p.data)]);
}

async function brandAssets() {
  const ICONS = path.join(PUBLIC, 'icons');
  await mkdir(ICONS, { recursive: true });

  const ico = [];
  for (const size of [16, 32, 48]) ico.push({ size, data: await brandSquare(size, 0.08, Math.round(size * 0.18)) });
  await writeFile(path.join(PUBLIC, 'favicon.ico'), toIco(ico));

  // SVG com o PNG embutido. TODO: trocar por um SVG vetorial do monograma quando houver.
  const svgPng = (await brandSquare(64, 0.1, 12)).toString('base64');
  await writeFile(
    path.join(PUBLIC, 'favicon.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64"><image width="64" height="64" xlink:href="data:image/png;base64,${svgPng}"/></svg>\n`,
  );

  await writeFile(path.join(PUBLIC, 'apple-touch-icon.png'), await brandSquare(180, 0.16));
  await writeFile(path.join(ICONS, 'icon-192.png'), await brandSquare(192, 0.16));
  await writeFile(path.join(ICONS, 'icon-512.png'), await brandSquare(512, 0.16));
  await writeFile(path.join(ICONS, 'icon-maskable-512.png'), await brandSquare(512, 0.26));

  // og-image 1200×630: texto e monograma à esquerda, foto do hero à direita.
  const W = 1200;
  const H = 630;
  const photoW = 470;
  const photoBuf = await sharp(path.join(SRC, 'snapinsta-1795089649150.jpg'))
    .rotate()
    .resize({ width: photoW, height: H, fit: 'cover', position: 'north' })
    .toBuffer();
  const trimmed = await sharp(path.join(SRC, LOGO_FILE)).trim({ threshold: 1 }).png().toBuffer();
  const mark = await sharp(trimmed).resize({ width: 120 }).toBuffer();
  const text = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${W - photoW - 1}" y="0" width="1" height="${H}" fill="#d4b781" opacity="0.5"/>
      <text x="80" y="300" font-family="Georgia, 'Times New Roman', serif" font-size="66" fill="#f6f1ea">Brunna Fortuna</text>
      <text x="82" y="345" font-family="Arial, Helvetica, sans-serif" font-size="20" letter-spacing="8" fill="#d4b781">ADVOCACIA</text>
      <text x="80" y="440" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="34" fill="#d4b781">Direito das Famílias</text>
      <text x="80" y="484" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="34" fill="#d4b781">e das Sucessões</text>
    </svg>`);
  await sharp({ create: { width: W, height: H, channels: 4, background: NAVY } })
    .composite([
      { input: photoBuf, left: W - photoW, top: 0 },
      { input: mark, left: 80, top: 120 },
      { input: text, left: 0, top: 0 },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(PUBLIC, 'og-image.jpg'));
}

await mkdir(OUT, { recursive: true });
await mkdir(MEDIA_OUT, { recursive: true });

const entries = [];
for (const p of PHOTOS) entries.push(await photo(p));
entries.push(...(await logo()));
await brandAssets();

const video = path.join(SRC, 'palestra.mp4');
if (existsSync(video)) await copyFile(video, path.join(MEDIA_OUT, 'palestra.mp4'));

const body = entries
  .map((e) => `  '${e.slug}': { width: ${e.width}, height: ${e.height}, widths: [${e.widths.join(', ')}] },`)
  .join('\n');

await writeFile(
  MANIFEST,
  `// Arquivo gerado por scripts/optimize-images.mjs. Não edite à mão.\n\n` +
    `export interface ImageAsset {\n  readonly width: number;\n  readonly height: number;\n  readonly widths: readonly number[];\n}\n\n` +
    `export const IMAGES = {\n${body}\n} as const satisfies Record<string, ImageAsset>;\n\n` +
    `export type ImageSlug = keyof typeof IMAGES;\n`,
);

console.log(entries.map((e) => `${e.slug} ${e.width}x${e.height} → [${e.widths}]`).join('\n'));
