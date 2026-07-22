import fs from 'fs';
import path from 'path';

const dir = 'uploads/products';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#eaf0f4"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#595862">Product</text>
</svg>`;

fs.writeFileSync(path.join(dir, 'default.png'), svgContent);
console.log('Created default.png fallback!');
