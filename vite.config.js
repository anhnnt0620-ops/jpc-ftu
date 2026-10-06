import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

// Custom plugin to ensure Image, Playlist, Font directories are seamlessly copied to dist for GitHub Pages
function copyStaticAssets() {
  return {
    name: 'copy-static-assets',
    closeBundle() {
      const folders = ['Image', 'Playlist', 'Font', 'model'];
      const outDir = path.resolve(process.cwd(), 'dist');
      
      // Ensure .nojekyll is always created in dist to prevent Jekyll processing
      try {
        fs.writeFileSync(path.resolve(outDir, '.nojekyll'), '');
        console.log('[Vite Build] Created dist/.nojekyll');
      } catch (err) {
        console.warn(`[Vite Build] Note: could not create dist/.nojekyll (${err.message})`);
      }

      folders.forEach((folder) => {
        const src = path.resolve(process.cwd(), folder);
        const dest = path.resolve(outDir, folder);
        if (fs.existsSync(src)) {
          try {
            if (fs.existsSync(dest)) {
              fs.rmSync(dest, { recursive: true, force: true });
            }
            fs.cpSync(src, dest, { recursive: true, force: true });
            console.log(`[Vite Build] Copied ${folder}/ -> dist/${folder}/`);
          } catch (err) {
            console.warn(`[Vite Build] Note: could not overwrite dist/${folder}/ directly (${err.message}). Existing files retained.`);
          }
        }
      });
    }
  };
}

export default defineConfig({
  // Base relative path ensures GitHub Pages (e.g. https://username.github.io/repo-name/) works flawlessly
  base: './',
  plugins: [
    copyStaticAssets()
  ],
  server: {
    port: 3000,
    open: true,
    cors: true,
    watch: {
      ignored: ['**/Minh họa/**', '**/dist/**', '**/.git/**']
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          animation: ['lenis', 'canvas-confetti']
        }
      }
    }
  }
});
