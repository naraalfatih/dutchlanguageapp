// Bundles the API together with the @praat/* workspace sources (which ship as TypeScript).
// Real npm dependencies stay external and are installed in the runtime image.
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const external = Object.keys(pkg.dependencies).filter((name) => !name.startsWith('@praat/'));

await build({
  entryPoints: ['src/index.ts', 'src/db/migrate.ts'],
  outdir: 'dist',
  outbase: 'src',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  sourcemap: true,
  external: [...external, ...external.map((name) => `${name}/*`)],
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
});
console.log('API built to dist/');
