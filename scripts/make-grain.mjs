/**
 * Bakes the grain tile to a PNG.
 *
 * The alternative — an feTurbulence data URI — makes the browser rasterise a
 * filter at load. This costs one deterministic 128x128 asset instead, at
 * 2-bit grayscale (four levels, which is plenty under a 12% overlay).
 *
 *   node scripts/make-grain.mjs
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SIZE = 128;
const BIT_DEPTH = 2; // four grey levels
const SEED = 0x5eed1e;

/** Same PRNG the ridge generator uses — the tile is reproducible. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

const rand = mulberry32(SEED);
const pixelsPerByte = 8 / BIT_DEPTH;
const bytesPerRow = SIZE / pixelsPerByte;
const raw = Buffer.alloc((bytesPerRow + 1) * SIZE);

let offset = 0;
for (let y = 0; y < SIZE; y++) {
  raw[offset++] = 0; // filter type: none
  for (let bx = 0; bx < bytesPerRow; bx++) {
    let byte = 0;
    for (let p = 0; p < pixelsPerByte; p++) {
      // Bias toward the middle so the tile reads as grain, not salt-and-pepper.
      const v = Math.min(3, Math.floor(((rand() + rand()) / 2) * 4));
      byte = (byte << BIT_DEPTH) | v;
    }
    raw[offset++] = byte;
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = BIT_DEPTH;
ihdr[9] = 0; // grayscale
ihdr[10] = 0; // deflate
ihdr[11] = 0; // adaptive filtering
ihdr[12] = 0; // no interlace

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'grain.png');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);

console.log(`grain.png  ${SIZE}x${SIZE}  ${BIT_DEPTH}-bit  ${(png.length / 1024).toFixed(1)} KB`);
