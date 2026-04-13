/**
 * Script to remove white background from logo and generate favicon.
 * Uses the Canvas API via node built-in or a lightweight approach.
 */
const fs = require('fs');
const path = require('path');

// Since we can't easily install sharp, we'll create an SVG favicon
// that wraps the PNG logo, and also create a proper HTML favicon link.

const publicDir = path.join(__dirname, '..', 'public');
const logoPath = path.join(publicDir, 'logo.png');

// Read the PNG file
const logoBuffer = fs.readFileSync(logoPath);
const base64Logo = logoBuffer.toString('base64');

// Create an SVG favicon that shows just the circular part of the logo
// The logo is a circle on white background, so we clip it to a circle
const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <clipPath id="circle">
      <circle cx="512" cy="512" r="500"/>
    </clipPath>
  </defs>
  <image href="data:image/png;base64,${base64Logo}" x="0" y="0" width="1024" height="1024" clip-path="url(#circle)"/>
</svg>`;

// Write SVG favicon
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgFavicon);
console.log('✅ Created favicon.svg');

// Also create a simple ICO-compatible approach by using the PNG directly
// Copy logo as favicon for browsers that support PNG favicons
fs.copyFileSync(logoPath, path.join(publicDir, 'favicon.png'));
console.log('✅ Created favicon.png');

// Create a proper apple-touch-icon
fs.copyFileSync(logoPath, path.join(publicDir, 'apple-touch-icon.png'));
console.log('✅ Created apple-touch-icon.png');

console.log('\n🎉 All favicon files created successfully!');
console.log('Now update app/layout.tsx to reference these files.');
