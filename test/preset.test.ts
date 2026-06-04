import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import {
    configFileName,
    configPath,
    packageName,
    resolveConfigPath,
} from "../src/preset";

const expectedCustomRuleIds = [
    "database-connection-strings",
    "nick2bad4u-sensitive-env-vars",
    "vite-env-secrets",
] as const;

describe("gitleaks-config-nick2bad4u", () => {
    it("exports a stable config file path", () => {
        expect.assertions(5);

        expect(packageName).toBe("gitleaks-config-nick2bad4u");
        expect(configFileName).toBe("gitleaks.toml");
        expect(configPath.endsWith("gitleaks.toml")).toBe(true);
        expect(configPath).not.toContain("package.json");
        expect(resolveConfigPath()).toBe(configPath);
    });

    it("extends the built-in Gitleaks rules and keeps focused custom rules", async () => {
        expect.assertions(10);

        const config = await readFile(configPath, "utf8");
        const ruleIds = Array.from(
            config.matchAll(/^id = "(?<ruleId>[^"]+)"$/gmv),
            ({ groups }) => groups?.["ruleId"]
        ).filter((ruleId): ruleId is string => ruleId !== undefined);

        expect(config).toContain('minVersion = "v8.25.0"');
        expect(config).toContain("[extend]");
        expect(config).toContain("useDefault = true");
        expect(config).toContain('disabledRules = ["generic-api-key"]');
        expect(config).toContain("[[allowlists]]");
        expect(ruleIds).toStrictEqual(
            expect.arrayContaining([...expectedCustomRuleIds])
        );
        expect(ruleIds).not.toContain("electron-config-secrets");
        expect(ruleIds).not.toContain("anthropic-enhanced-detection");
        expect(ruleIds).not.toContain("perplexity-api-detection");
        expect(config).not.toContain("Uptime Watcher");
    });

    it("keeps the repository scan config pointed at the packaged config", async () => {
        expect.assertions(3);

        const repositoryConfig = await readFile(
            new URL("../.gitleaks.toml", import.meta.url),
            "utf8"
        );

        expect(repositoryConfig).toContain("[extend]");
        expect(repositoryConfig).toContain('path = "gitleaks.toml"');
        expect(repositoryConfig).not.toContain("useDefault = true");
    });

    it("detects the Google client secret without treating the client id as a secret", async () => {
        expect.assertions(2);

        const config = await readFile(configPath, "utf8");

        expect(config).toContain("UPTIME_WATCHER_GOOGLE_CLIENT_SECRET");
        expect(config).not.toContain("UPTIME_WATCHER_GOOGLE_CLIENT_ID");
    });
});
