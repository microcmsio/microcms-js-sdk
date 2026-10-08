import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir, platform, arch, cpus } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { compilerBinary } from '../tests/helpers/type-compiler.mjs';

const fixtures = new URL(
  '../tests/fixtures/typegen/performance/',
  import.meta.url,
);
const scenarios = JSON.parse(
  await readFile(new URL('scenarios.json', fixtures), 'utf8'),
);
const sdk = fileURLToPath(new URL('../dist/microcms-js-sdk', import.meta.url));
const report = {
  node: process.version,
  platform: `${platform()}/${arch()}`,
  cpu: cpus()[0]?.model,
  repeats: 3,
  scenarios: [],
};
const temporary = await mkdtemp(join(tmpdir(), 'microcms-type-performance-'));
try {
  for (const scenario of scenarios) {
    const generated = await readFile(
      new URL(scenario.name + '/generated.ts', fixtures),
      'utf8',
    );
    const usage = await readFile(
      new URL(scenario.name + '/usage.ts', fixtures),
      'utf8',
    );
    await writeFile(join(temporary, 'generated.ts'), generated);
    await writeFile(
      join(temporary, 'usage.ts'),
      usage.replace("from '../../../../..'", 'from ' + JSON.stringify(sdk)),
    );
    const measurements = [];
    {
      const binary = compilerBinary();
      const version = spawnSync(process.execPath, [binary, '--version'], {
        encoding: 'utf8',
      }).stdout.trim();
      for (let repeat = 0; repeat < report.repeats; repeat++) {
        const start = performance.now();
        const result = spawnSync(
          process.execPath,
          [
            binary,
            '--ignoreConfig',
            '--pretty',
            'false',
            '--noEmit',
            '--strict',
            '--exactOptionalPropertyTypes',
            '--target',
            'ES2022',
            '--module',
            'ESNext',
            '--moduleResolution',
            'Bundler',
            '--extendedDiagnostics',
            join(temporary, 'usage.ts'),
          ],
          { encoding: 'utf8', timeout: 60000, maxBuffer: 1024 * 1024 },
        );
        if (result.status !== 0)
          throw new Error(
            result.stdout + result.stderr + (result.error?.message ?? ''),
          );
        const diagnostics = Object.fromEntries(
          result.stdout.split('\n').flatMap((line) => {
            const match = line.match(/^([^:]+):\s*(.+?)\s*$/);
            return match ? [[match[1], match[2]]] : [];
          }),
        );
        measurements.push({
          version,
          repeat: repeat + 1,
          elapsedMs: Math.round(performance.now() - start),
          diagnostics,
        });
      }
    }
    const item = {
      ...scenario,
      generatedBytes: Buffer.byteLength(generated),
      measurements,
    };
    report.scenarios.push(item);
    console.log(JSON.stringify(item));
  }
  console.log(
    JSON.stringify({ environment: { ...report, scenarios: undefined } }),
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
