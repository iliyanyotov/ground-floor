const versionFile = Bun.file('.bun-version');

if (await versionFile.exists()) {
  const requiredVersion = (await versionFile.text()).trim();

  if (Bun.semver.order(Bun.version, requiredVersion) < 0) {
    console.error(
      `Bun ${Bun.version} is older than required ${requiredVersion} (.bun-version). Run: bun upgrade`,
    );

    process.exit(1);
  }
}
