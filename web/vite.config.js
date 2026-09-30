import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function copyToAndroidPlugin() {
  return {
    name: 'copy-to-android',
    closeBundle() {
      const srcDir = path.resolve(__dirname, 'dist');
      const destDir = path.resolve(__dirname, '../android/app/src/main/assets/web');

      function copyRecursiveSync(src, dest) {
        const exists = fs.existsSync(src);
        const stats = exists && fs.statSync(src);
        const isDirectory = exists && stats.isDirectory();
        if (isDirectory) {
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }
          fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
          });
        } else {
          fs.copyFileSync(src, dest);
        }
      }

      if (fs.existsSync(srcDir)) {
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        copyRecursiveSync(srcDir, destDir);
        console.log('✓ Successfully synced bundle to Android assets and web/dist!');
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), copyToAndroidPlugin()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
