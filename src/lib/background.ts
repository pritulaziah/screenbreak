export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

function isPng(bytes: Uint8Array) {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

function isJpeg(bytes: Uint8Array) {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isWebp(bytes: Uint8Array) {
  return (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

/** Reads the file header so the client accepts the same formats as the backend. */
export async function isAcceptedImage(file: File) {
  if (file.size > MAX_IMAGE_BYTES) return false;

  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    return isPng(bytes) || isJpeg(bytes) || isWebp(bytes);
  } catch {
    return false;
  }
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
  previous: number | null = null,
) {
  if (count <= 0) return 0;
  if (!random) return ((seed % count) + count) % count;

  let pick = hash(seed) % count;
  if (count > 1 && previous !== null && pick === previous) {
    pick = (pick + 1) % count;
  }
  return pick;
}
