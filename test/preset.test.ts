import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import {
    configFileName,
    configPath,
    packageName,
    resolveConfigPath,
} from "../src/preset";

describe("gitleaks-config-nick2bad4u", () => {
    it("exports a stable config file path", () => {
        expect.assertions(5);

        expect(packageName).toBe("gitleaks-config-nick2bad4u");
        expect(configFileName).toBe("gitleaks.toml");
        expect(configPath.endsWith("gitleaks.toml")).toBe(true);
        expect(configPath).not.toContain("package.json");
        expect(resolveConfigPath()).toBe(configPath);
    });

    it("extends the built-in Gitleaks rules and keeps source custom rules", async () => {
        expect.assertions(8);

        const config = await readFile(configPath, "utf8");

        expect(config).toContain("[extend]");
        expect(config).toContain("useDefault = true");
        expect(config).toContain("electron-config-secrets");
        expect(config).toContain("database-connection-strings");
        expect(config).toContain("vite-env-secrets");
        expect(config).toContain("anthropic-enhanced-detection");
        expect(config).toContain("perplexity-api-detection");
        expect(config).not.toContain("Uptime Watcher");
    });
});
