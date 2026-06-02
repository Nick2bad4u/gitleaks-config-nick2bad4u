# gitleaks-config-nick2bad4u

[![CI](https://github.com/Nick2bad4u/gitleaks-config-nick2bad4u/actions/workflows/ci.yml/badge.svg)](https://github.com/Nick2bad4u/gitleaks-config-nick2bad4u/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/gitleaks-config-nick2bad4u.svg)](https://www.npmjs.com/package/gitleaks-config-nick2bad4u)

Shared Gitleaks config for Nick2bad4u projects.

## Install

```sh
npm install --save-dev gitleaks-config-nick2bad4u
```

## Usage

Gitleaks consumes config files by path:

```sh
gitleaks git --config node_modules/gitleaks-config-nick2bad4u/gitleaks.toml .
```

The package also exports `configPath` for Node-based tooling that needs to resolve the packaged TOML file.

## Verification

```sh
npm run release:verify
```
