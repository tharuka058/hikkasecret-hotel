const fs = require('fs');
const path = require('path');

const srcDir = 'd:/hotel/imgs';
const destDir = 'd:/hotel/frontend/public/images/booking_gallery';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir).filter(f => f.toLowerCase().endsWith('.png') || f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg'));

// Sort files chronologically or by filename
files.sort((a, b) => a.localeCompare(b));

files.forEach((file, index) => {
  const num = String(index + 1).padStart(2, '0');
  const ext = path.extname(file);
  const destName = `booking-photo-${num}${ext}`;
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, destName));
  console.log(`Copied ${file} -> ${destName}`);
});

console.log(`Successfully copied ${files.length} images!`);
