# Contributing

Thanks for helping improve `gitleaks-config-nick2bad4u`. This repository ships a small shared configuration package for Gitleaks.

## Local Workflow

1. Install dependencies with `npm ci --force`.
2. Make the config or documentation change.
3. Run `npm run release:verify`.

## Package Surface

The public surface is intentionally small:

- packaged config files: `gitleaks.toml`;
- `src/preset.ts` for typed helper exports;
- `README.md` for consumer usage.

Do not add a custom CLI when Gitleaks already supports native config loading.
