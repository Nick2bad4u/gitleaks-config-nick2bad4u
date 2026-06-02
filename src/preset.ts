import * as path from "node:path";
import { fileURLToPath } from "node:url";

/** Packaged Gitleaks TOML config filename. */
export const configFileName = "gitleaks.toml" as const;

/** Published package name for this shared Gitleaks config. */
export const packageName = "gitleaks-config-nick2bad4u" as const;

/**
 * Resolves the packaged Gitleaks config from an ESM module URL.
 *
 * @param fromUrl - Module URL to resolve from.
 *
 * @returns Absolute path to the packaged Gitleaks config file.
 */
export function resolveConfigPath(fromUrl: string = import.meta.url): string {
    return path.join(
        path.dirname(fileURLToPath(fromUrl)),
        "..",
        configFileName
    );
}

/** Absolute path to the packaged Gitleaks config file. */
export const configPath: string = resolveConfigPath();
