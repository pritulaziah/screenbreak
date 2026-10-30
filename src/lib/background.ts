export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const ACCEPTED_NAME = /\.(png|jpe?g|webp)$/i;

export function isAcceptedImage(file: File) {
  return ACCEPTED_TYPES.has(file.type) || ACCEPTED_NAME.test(file.name);
}

function hash(value: number) {
  let result = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  result = Math.imul(result ^ (result >>> 16), 0x45d9f3b);
  return (result ^ (result >>> 16)) >>> 0;
}

export function pickBackgroundIndex(
  seed: number,
  count: number,
  random: boolean,
) {
  if (count <= 0) return 0;
  if (!random) return ((seed % count) + count) % count;

  const pick = hash(seed) % count;
  if (count > 1 && pick === hash(seed - 1) % count) {
    return (pick + 1) % count;
  }
  return pick;
}
