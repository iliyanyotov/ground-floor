import { existsSync, readFileSync } from 'node:fs';

if (existsSync('.bun-version')) {
  const required = readFileSync('.bun-version', 'utf8').trim();

  if (Bun.semver.order(Bun.version, required) < 0) {
    console.error(
      `Bun ${Bun.version} is older than required ${required} (.bun-version). Run: bun upgrade`,
    );

    process.exit(1);
  }
}
