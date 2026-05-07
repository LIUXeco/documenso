const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'assets', 'brand', 'liux-box.jpg');
const OUT_DIR = path.join(__dirname, '..', 'apps', 'remix', 'public');

async function squarePng(size) {
  return sharp(SRC).resize({ width: size, height: size, fit: 'cover' }).png().toBuffer();
}

function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  const images = [];
  let offset = 6 + count * 16;

  for (const { size, buf } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0);
    entry.writeUInt8(size === 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    images.push(buf);
    offset += buf.length;
  }

  return Buffer.concat([header, ...dirEntries, ...images]);
}

(async () => {
  const sizes = [16, 32, 48, 64];
  const pngs = [];
  for (const size of sizes) {
    const buf = await squarePng(size);
    pngs.push({ size, buf });
  }

  const ico = buildIco(pngs);
  fs.writeFileSync(path.join(OUT_DIR, 'favicon.ico'), ico);

  fs.writeFileSync(path.join(OUT_DIR, 'favicon-16x16.png'), await squarePng(16));
  fs.writeFileSync(path.join(OUT_DIR, 'favicon-32x32.png'), await squarePng(32));
  fs.writeFileSync(path.join(OUT_DIR, 'apple-touch-icon.png'), await squarePng(180));
  fs.writeFileSync(path.join(OUT_DIR, 'android-chrome-192x192.png'), await squarePng(192));
  fs.writeFileSync(path.join(OUT_DIR, 'android-chrome-512x512.png'), await squarePng(512));

  console.log('favicons written to', OUT_DIR);
})();
