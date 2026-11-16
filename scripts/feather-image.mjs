import sharp from 'sharp';

// Bake a smooth, fully transparent border so fallback images composite like WebGL.
export async function featherImage(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const smooth = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const edgeX = Math.min(x, info.width - 1 - x) / (info.width * .15);
      const edgeY = Math.min(y, info.height - 1 - y) / (info.height * .15);
      const alpha = (y * info.width + x) * 4 + 3;
      data[alpha] = Math.round(data[alpha] * smooth(edgeX) * smooth(edgeY));
    }
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
}
