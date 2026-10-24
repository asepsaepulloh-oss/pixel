import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function buildElectron() {
  console.log('Building Electron main and preload scripts...');
  
  await esbuild.build({
    entryPoints: [path.join(root, 'electron/main.ts')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: path.join(root, 'electron/dist/main.cjs'),
    external: ['electron'],
    format: 'cjs'
  });

  await esbuild.build({
    entryPoints: [path.join(root, 'electron/preload.ts')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: path.join(root, 'electron/dist/preload.cjs'),
    external: ['electron'],
    format: 'cjs'
  });

  console.log('Electron scripts built successfully into electron/dist/');
}

buildElectron().catch(err => {
  console.error(err);
  process.exit(1);
});
