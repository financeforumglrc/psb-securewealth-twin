const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, 'slides');

async function createGradient(filename, c1, c2, angle = '180') {
  const coords = {
    '180': { x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
    '135': { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
    '90':  { x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
    '45':  { x1: '0%', y1: '100%', x2: '100%', y2: '0%' },
  }[angle] || { x1: '0%', y1: '0%', x2: '0%', y2: '100%' };

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540">
    <defs><linearGradient id="g" x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}">
      <stop offset="0%" style="stop-color:${c1}"/>
      <stop offset="100%" style="stop-color:${c2}"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, filename));
  console.log(`  Created ${filename}`);
}

async function createAccentBar(filename, color, w = 960, h = 6) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="100%" height="100%" fill="${color}"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, filename));
  console.log(`  Created ${filename}`);
}

async function main() {
  console.log('Generating backgrounds...');
  // Main dark backgrounds
  await createGradient('bg-main.png', '#1A1D23', '#0D1B2A', '135');
  await createGradient('bg-title.png', '#0D1B2A', '#1A1D23', '45');
  await createGradient('bg-alt.png', '#141821', '#1A2332', '180');
  await createGradient('bg-section.png', '#0F1923', '#1A1D23', '90');
  // Accent bars
  await createAccentBar('bar-gold.png', '#D4A84B', 960, 4);
  await createAccentBar('bar-blue.png', '#4A9EFF', 960, 4);
  await createAccentBar('bar-gold-thick.png', '#D4A84B', 960, 8);
  console.log('Done!');
}

main().catch(console.error);
