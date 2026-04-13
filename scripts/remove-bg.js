/**
 * Remove white background from logo.png using pure Node.js PNG processing.
 * Reads the PNG, makes white/near-white pixels transparent, writes back.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const publicDir = path.join(__dirname, '..', 'public');
const inputPath = path.join(publicDir, 'logo.png');

// Simple PNG reader/writer for RGBA manipulation
function readPNG(buffer) {
  // Verify PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!buffer.slice(0, 8).equals(signature)) {
    throw new Error('Not a valid PNG file');
  }

  let offset = 8;
  let width, height, bitDepth, colorType;
  const dataChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.slice(offset + 8, offset + 8 + length);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      dataChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }

    offset += 12 + length; // 4 (length) + 4 (type) + length + 4 (crc)
  }

  const compressedData = Buffer.concat(dataChunks);
  const rawData = zlib.inflateSync(compressedData);

  // Determine bytes per pixel
  let bpp;
  switch (colorType) {
    case 0: bpp = 1; break;  // Grayscale
    case 2: bpp = 3; break;  // RGB
    case 4: bpp = 2; break;  // Grayscale + Alpha
    case 6: bpp = 4; break;  // RGBA
    default: throw new Error(`Unsupported color type: ${colorType}`);
  }

  // Unfilter the raw data
  const stride = width * bpp + 1; // +1 for filter byte
  const pixels = Buffer.alloc(width * height * 4); // Always output RGBA

  const prevRow = Buffer.alloc(width * bpp);
  
  for (let y = 0; y < height; y++) {
    const filterType = rawData[y * stride];
    const row = Buffer.alloc(width * bpp);
    
    for (let x = 0; x < width * bpp; x++) {
      const raw = rawData[y * stride + 1 + x];
      let a = x >= bpp ? row[x - bpp] : 0;
      let b = prevRow[x];
      let c = x >= bpp ? prevRow[x - bpp] : 0;
      
      let value;
      switch (filterType) {
        case 0: value = raw; break;
        case 1: value = (raw + a) & 0xFF; break;
        case 2: value = (raw + b) & 0xFF; break;
        case 3: value = (raw + Math.floor((a + b) / 2)) & 0xFF; break;
        case 4: { // Paeth
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          value = (raw + pr) & 0xFF;
          break;
        }
        default: value = raw;
      }
      row[x] = value;
    }
    
    // Convert to RGBA
    for (let x = 0; x < width; x++) {
      const pixelOffset = (y * width + x) * 4;
      if (colorType === 6) { // RGBA
        pixels[pixelOffset] = row[x * 4];
        pixels[pixelOffset + 1] = row[x * 4 + 1];
        pixels[pixelOffset + 2] = row[x * 4 + 2];
        pixels[pixelOffset + 3] = row[x * 4 + 3];
      } else if (colorType === 2) { // RGB
        pixels[pixelOffset] = row[x * 3];
        pixels[pixelOffset + 1] = row[x * 3 + 1];
        pixels[pixelOffset + 2] = row[x * 3 + 2];
        pixels[pixelOffset + 3] = 255;
      }
    }
    
    row.copy(prevRow);
  }

  return { width, height, pixels };
}

function writePNG(width, height, pixels) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  // Create raw image data with filter bytes
  const stride = width * 4 + 1;
  const rawData = Buffer.alloc(height * stride);
  
  for (let y = 0; y < height; y++) {
    rawData[y * stride] = 0; // No filter
    for (let x = 0; x < width * 4; x++) {
      rawData[y * stride + 1 + x] = pixels[(y * width * 4) + x];
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const typeBuffer = Buffer.from(type, 'ascii');
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32BE(data.length, 0);
    
    const crcInput = Buffer.concat([typeBuffer, data]);
    const crc = crc32(crcInput);
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc, 0);
    
    return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
  }

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 implementation
function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

try {
  console.log('📖 Reading logo.png...');
  const pngBuffer = fs.readFileSync(inputPath);
  const { width, height, pixels } = readPNG(pngBuffer);
  console.log(`📐 Image size: ${width}x${height}`);

  // Remove white background - make white/near-white pixels transparent
  let transparentCount = 0;
  const threshold = 240; // Pixels with R,G,B all above this become transparent
  
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    
    // Check if pixel is white or near-white
    if (r >= threshold && g >= threshold && b >= threshold) {
      pixels[i + 3] = 0; // Make fully transparent
      transparentCount++;
    }
  }

  console.log(`🔍 Made ${transparentCount} white pixels transparent`);

  // Write the processed image
  const outputBuffer = writePNG(width, height, pixels);
  fs.writeFileSync(path.join(publicDir, 'logo.png'), outputBuffer);
  console.log('✅ Saved logo.png (white background removed)');

  // Also update favicon files
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), outputBuffer);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), outputBuffer);
  console.log('✅ Updated favicon.png and apple-touch-icon.png');

  console.log('\n🎉 Done! White background has been removed from all logo files.');
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
