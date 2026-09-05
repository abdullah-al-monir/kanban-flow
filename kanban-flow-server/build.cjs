const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { buildSync } = require('esbuild');

const projectRoot = path.resolve(__dirname, '..');
const temporaryOutput = path.join(projectRoot, '.build');
const distOutput = path.join(projectRoot, 'dist');
const typescriptCompiler = require.resolve('typescript/bin/tsc');

fs.rmSync(temporaryOutput, { recursive: true, force: true });
fs.rmSync(distOutput, { recursive: true, force: true });

try {
  execFileSync(
    process.execPath,
    [
      typescriptCompiler,
      '--project',
      path.join(projectRoot, 'tsconfig.build.json'),
      '--incremental',
      'false',
      '--outDir',
      temporaryOutput,
    ],
    { cwd: projectRoot, stdio: 'inherit' },
  );
  fs.writeFileSync(
    path.join(temporaryOutput, 'package.json'),
    JSON.stringify({ type: 'module' }),
  );

  buildSync({
    absWorkingDir: projectRoot,
    entryPoints: [path.join(temporaryOutput, 'main.js')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    packages: 'external',
    outfile: path.join(distOutput, 'main.js'),
    sourcemap: true,
  });

  fs.writeFileSync(
    path.join(distOutput, 'package.json'),
    JSON.stringify({ type: 'module' }),
  );
} finally {
  fs.rmSync(temporaryOutput, { recursive: true, force: true });
}
