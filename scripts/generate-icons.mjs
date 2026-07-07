import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const DEFAULT_SOURCE =
  "/Users/amandaalden/Downloads/ChatGPT Image May 13, 2026, 08_51_32 PM.png";
const source = process.argv[2] || DEFAULT_SOURCE;

function readUInt32(buffer, offset) {
  return buffer.readUInt32BE(offset);
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(file) {
  const buffer = fs.readFileSync(file);
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error(`Not a PNG: ${file}`);
  }
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idat = [];
  while (offset < buffer.length) {
    const length = readUInt32(buffer, offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = readUInt32(data, 0);
      height = readUInt32(data, 4);
      const bitDepth = data[8];
      colorType = data[9];
      if (bitDepth !== 8 || ![2, 6].includes(colorType)) {
        throw new Error("Icon generator supports 8-bit RGB/RGBA PNGs only.");
      }
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }
  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const inflated = zlib.inflateSync(Buffer.concat(idat));
  const pixels = new Uint8ClampedArray(width * height * 4);
  let readOffset = 0;
  let previous = new Uint8Array(stride);
  for (let y = 0; y < height; y += 1) {
    const filter = inflated[readOffset];
    readOffset += 1;
    const row = inflated.subarray(readOffset, readOffset + stride);
    readOffset += stride;
    const recon = new Uint8Array(stride);
    for (let x = 0; x < stride; x += 1) {
      const left = x >= channels ? recon[x - channels] : 0;
      const up = previous[x] ?? 0;
      const upLeft = x >= channels ? previous[x - channels] : 0;
      let value = row[x];
      if (filter === 1) value = (value + left) & 255;
      else if (filter === 2) value = (value + up) & 255;
      else if (filter === 3)
        value = (value + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) value = (value + paeth(left, up, upLeft)) & 255;
      recon[x] = value;
    }
    for (let x = 0; x < width; x += 1) {
      const src = x * channels;
      const dst = (y * width + x) * 4;
      pixels[dst] = recon[src];
      pixels[dst + 1] = recon[src + 1];
      pixels[dst + 2] = recon[src + 2];
      pixels[dst + 3] = channels === 4 ? recon[src + 3] : 255;
    }
    previous = recon;
  }
  return { width, height, pixels };
}

function removeCheckerboard(image) {
  const { width, height, pixels } = image;
  const seen = new Uint8Array(width * height);
  const queue = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (seen[index]) return;
    const offset = index * 4;
    const r = pixels[offset];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const avg = (r + g + b) / 3;
    if (avg < 176 || max - min > 48) return;
    seen[index] = 1;
    queue.push([x, y]);
  };
  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }
  for (let i = 0; i < queue.length; i += 1) {
    const [x, y] = queue[i];
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  for (let i = 0; i < seen.length; i += 1) {
    if (!seen[i]) continue;
    pixels[i * 4 + 3] = 0;
  }
  return image;
}

function cropToAlpha(image) {
  const { width, height, pixels } = image;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = pixels[(y * width + x) * 4 + 3];
      if (alpha <= 8) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (minX > maxX) return image;
  const sourceW = maxX - minX + 1;
  const sourceH = maxY - minY + 1;
  const square = Math.max(sourceW, sourceH);
  const margin = Math.round(square * 0.045);
  const cropSize = square + margin * 2;
  const out = new Uint8ClampedArray(cropSize * cropSize * 4);
  const startX = minX - Math.floor((cropSize - sourceW) / 2);
  const startY = minY - Math.floor((cropSize - sourceH) / 2);
  for (let y = 0; y < cropSize; y += 1) {
    for (let x = 0; x < cropSize; x += 1) {
      const sx = startX + x;
      const sy = startY + y;
      const dst = (y * cropSize + x) * 4;
      if (sx < 0 || sy < 0 || sx >= width || sy >= height) continue;
      const src = (sy * width + sx) * 4;
      out[dst] = pixels[src];
      out[dst + 1] = pixels[src + 1];
      out[dst + 2] = pixels[src + 2];
      out[dst + 3] = pixels[src + 3];
    }
  }
  return { width: cropSize, height: cropSize, pixels: out };
}

function resize(image, size) {
  const out = new Uint8ClampedArray(size * size * 4);
  const scaleX = image.width / size;
  const scaleY = image.height / size;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const sx = Math.min(
        image.width - 1,
        Math.max(0, (x + 0.5) * scaleX - 0.5),
      );
      const sy = Math.min(
        image.height - 1,
        Math.max(0, (y + 0.5) * scaleY - 0.5),
      );
      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const x1 = Math.min(image.width - 1, x0 + 1);
      const y1 = Math.min(image.height - 1, y0 + 1);
      const tx = sx - x0;
      const ty = sy - y0;
      const dst = (y * size + x) * 4;
      for (let c = 0; c < 4; c += 1) {
        const p00 = image.pixels[(y0 * image.width + x0) * 4 + c];
        const p10 = image.pixels[(y0 * image.width + x1) * 4 + c];
        const p01 = image.pixels[(y1 * image.width + x0) * 4 + c];
        const p11 = image.pixels[(y1 * image.width + x1) * 4 + c];
        out[dst + c] =
          p00 * (1 - tx) * (1 - ty) +
          p10 * tx * (1 - ty) +
          p01 * (1 - tx) * ty +
          p11 * tx * ty;
      }
    }
  }
  return { width: size, height: size, pixels: out };
}

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data = Buffer.alloc(0)) {
  const typeBuffer = Buffer.from(type);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  typeBuffer.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return out;
}

function encodePng(image) {
  const raw = Buffer.alloc((image.width * 4 + 1) * image.height);
  let offset = 0;
  for (let y = 0; y < image.height; y += 1) {
    raw[offset] = 0;
    offset += 1;
    Buffer.from(
      image.pixels.buffer,
      image.pixels.byteOffset + y * image.width * 4,
      image.width * 4,
    ).copy(raw, offset);
    offset += image.width * 4;
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(image.width, 0);
  ihdr.writeUInt32BE(image.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const signature = Buffer.from("89504e470d0a1a0a", "hex");
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND"),
  ]);
}

function writeIco(entries) {
  const header = Buffer.alloc(6 + entries.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  let imageOffset = header.length;
  entries.forEach((entry, index) => {
    const offset = 6 + index * 16;
    header[offset] = entry.size >= 256 ? 0 : entry.size;
    header[offset + 1] = entry.size >= 256 ? 0 : entry.size;
    header[offset + 2] = 0;
    header[offset + 3] = 0;
    header.writeUInt16LE(1, offset + 4);
    header.writeUInt16LE(32, offset + 6);
    header.writeUInt32LE(entry.bytes.length, offset + 8);
    header.writeUInt32LE(imageOffset, offset + 12);
    imageOffset += entry.bytes.length;
  });
  fs.writeFileSync(
    "favicon.ico",
    Buffer.concat([header, ...entries.map((e) => e.bytes)]),
  );
}

if (!fs.existsSync(source)) {
  throw new Error(`Favicon source not found: ${source}`);
}

const cleaned = cropToAlpha(removeCheckerboard(decodePng(source)));
const icon512 = encodePng(resize(cleaned, 512));
const icon192 = encodePng(resize(cleaned, 192));
const icon64 = encodePng(resize(cleaned, 64));
const icon48 = encodePng(resize(cleaned, 48));
const icon32 = encodePng(resize(cleaned, 32));
const icon16 = encodePng(resize(cleaned, 16));

fs.writeFileSync("icon-512.png", icon512);
fs.writeFileSync("icon-192.png", icon192);
fs.writeFileSync("icon-64.png", icon64);
fs.writeFileSync("icon-48.png", icon48);
writeIco([
  { size: 16, bytes: icon16 },
  { size: 32, bytes: icon32 },
  { size: 48, bytes: icon48 },
]);

const embedded = icon192.toString("base64");
fs.writeFileSync(
  "icon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="42" fill="#07101a"/><circle cx="96" cy="96" r="82" fill="#0f1b28"/><image href="data:image/png;base64,${embedded}" width="192" height="192"/></svg>\n`,
);

console.log(`Generated favicon/app icons from ${path.basename(source)}`);
