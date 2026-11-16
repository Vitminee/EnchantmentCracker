const zlib = require('zlib');
const fs = require('fs');

function parsePng(file) {
  const buf = fs.readFileSync(file);
  let pos = 8;
  let width, height, bitDepth, colorType, idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      width = buf.readUInt32BE(pos + 8);
      height = buf.readUInt32BE(pos + 12);
      bitDepth = buf[pos + 16];
      colorType = buf[pos + 17];
    } else if (type === 'IDAT') {
      idat.push(buf.slice(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }
  const data = Buffer.concat(idat);
  const raw = zlib.inflateSync(data);
  return { width, height, raw };
}

function getPixel(raw, width, x, y, bpp = 4) {
  const row = y * (width * bpp + 1);
  const offset = row + 1 + x * bpp;
  return [raw[offset], raw[offset+1], raw[offset+2], raw[offset+3]];
}

const p = parsePng('public/data/buttonblue.png');
// Print color values for opaque pixels in the first half (unpinned)
for (let y = 0; y < 18; y++) {
  for (let x = 0; x < 18; x++) {
    const px = getPixel(p.raw, p.width, x, y);
    if (px[3] > 0) {
      console.log('x=' + x + ', y=' + y + ': rgba(' + px[0] + ', ' + px[1] + ', ' + px[2] + ', ' + px[3] + ')');
    }
  }
}
