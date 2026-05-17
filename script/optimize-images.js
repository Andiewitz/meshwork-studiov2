import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const assetsDir = path.resolve('client/public/assets');

async function optimizeImages() {
  console.log('Starting image optimization...');
  const files = fs.readdirSync(assetsDir);
  
  for (const file of files) {
    if (file.startsWith('carousel-') && file.endsWith('.png')) {
      const inputPath = path.join(assetsDir, file);
      const outputPath = path.join(assetsDir, file.replace('.png', '.webp'));
      
      console.log(`Optimizing ${file}...`);
      
      await sharp(inputPath)
        .resize({ width: 800, withoutEnlargement: true }) // 800px is perfect for 2x retina display of a 400px card
        .webp({ quality: 80 }) // High quality webp compression
        .toFile(outputPath);
        
      console.log(`Saved as ${file.replace('.png', '.webp')}`);
    }
  }
  
  console.log('Optimization complete!');
}

optimizeImages().catch(console.error);
