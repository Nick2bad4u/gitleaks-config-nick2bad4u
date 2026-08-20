# gitleaks-config-nick2bad4u

[![npm license.](https://flat.badgen.net/npm/license/gitleaks-config-nick2bad4u?color=purple)](https://github.com/Nick2bad4u/gitleaks-config-nick2bad4u/blob/main/LICENSE)
[![npm total downloads.](https://flat.badgen.net/npm/dt/gitleaks-config-nick2bad4u?color=pink)](https://www.npmjs.com/package/gitleaks-config-nick2bad4u)
[![latest GitHub release.](https://flat.badgen.net/github/release/Nick2bad4u/gitleaks-config-nick2bad4u?color=cyan)](https://github.com/Nick2bad4u/gitleaks-config-nick2bad4u/releases)
[![GitHub stars.](https://flat.badgen.net/github/stars/Nick2bad4u/gitleaks-config-nick2bad4u?color=yellow)](https://github.com/Nick2bad4u/gitleaks-config-nick2bad4u/stargazers)
[![GitHub open issues.](https://flat.badgen.net/github/open-issues/Nick2bad4u/gitleaks-config-nick2bad4u?color=red)](https://github.com/Nick2bad4u/gitleaks-config-nick2bad4u/issues)
[![codecov.](https://flat.badgen.net/codecov/github/Nick2bad4u/gitleaks-config-nick2bad4u?color=blue)](https://codecov.io/gh/Nick2bad4u/gitleaks-config-nick2bad4u)

Shared Gitleaks configuration for Nick2bad4u JavaScript and TypeScript projects.

## What It Does

This package publishes a raw `gitleaks.toml` file plus a typed Node helper for tooling that needs to resolve that file. The config:

- extends the built-in Gitleaks rule set with `useDefault = true`;
- disables the noisy `generic-api-key` default rule;
- adds focused checks for database connection strings with embedded credentials, high-signal Vite secret variable names, and known sensitive Nick2bad4u environment variables in equals-style or quoted mapping assignments;
- keeps global allowlists narrow and explicit.

It does not wrap Gitleaks in a custom CLI. Consumers should keep using Gitleaks' native `--config`, `GITLEAKS_CONFIG`, or repository `.gitleaks.toml` loading paths.

## Install

```sh
npm install --save-dev gitleaks-config-nick2bad4u
```

Install Gitleaks separately through Homebrew, Docker, GitHub Actions, or the official release binaries.

## Usage

Run Gitleaks directly against the packaged config:

```sh
gitleaks git --config node_modules/gitleaks-config-nick2bad4u/gitleaks.toml .
```

For a repository-local config, add `.gitleaks.toml` at the repository root:

```toml
title = "Project secret detection"

[extend]
path = "node_modules/gitleaks-config-nick2bad4u/gitleaks.toml"
```

Gitleaks resolves `extend.path` relative to the directory where Gitleaks is invoked, so run scans from the repository root or adjust the path for your workflow.

## GitHub Actions

Use the official Gitleaks action and point `GITLEAKS_CONFIG` at the packaged config or at a local `.gitleaks.toml` that extends it:

```yaml
- uses: gitleaks/gitleaks-action@v3
  env:
   GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   GITLEAKS_CONFIG: .gitleaks.toml
```

## Node Helper

The package exports `configPath` for scripts that need the absolute path to the packaged TOML file:

```ts
import { configPath } from "gitleaks-config-nick2bad4u";

console.log(configPath);
```

## Verification

This repository uses strict package, lint, type, test, coverage, and publishability checks:

```sh
npm run release:verify
```

Coverage is expected to stay at 100% for the TypeScript helper surface.
