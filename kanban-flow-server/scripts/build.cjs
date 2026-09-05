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
      '--module',
      'commonjs',
      '--moduleResolution',
      'node',
      '--resolvePackageJsonExports',
      'false',
      '--types',
      'node',
      '--ignoreDeprecations',
      '6.0',
      '--incremental',
      'false',
      '--outDir',
      temporaryOutput,
    ],
    { cwd: projectRoot, stdio: 'inherit' },
  );
  fs.writeFileSync(
    path.join(temporaryOutput, 'package.json'),
    JSON.stringify({ type: 'commonjs' }),
  );

  buildSync({
    absWorkingDir: projectRoot,
    entryPoints: [path.join(temporaryOutput, 'main.js')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    packages: 'external',
    outfile: path.join(distOutput, 'main.cjs'),
    sourcemap: true,
  });
} finally {
  fs.rmSync(temporaryOutput, { recursive: true, force: true });
}
