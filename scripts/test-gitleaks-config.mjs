#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
    existsSync,
    mkdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import * as path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const fallbackGitleaksVersion = "v8.25.0";
const gitleaksModule = `github.com/zricethezav/gitleaks/v8@${fallbackGitleaksVersion}`;
const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtureDirectory = path.join(repoRoot, ".gitleaks-smoke");
const configPath = path.join(repoRoot, "gitleaks.toml");

/**
 * Run a process and capture output.
 *
 * @param {string} command
 * @param {readonly string[]} argumentList
 *
 * @returns {import("node:child_process").SpawnSyncReturns<string>}
 */
const runProcess = (command, argumentList) =>
    spawnSync(command, [...argumentList], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: "pipe",
    });

/**
 * Resolve the preferred Gitleaks runner.
 *
 * @returns {{ arguments: string[]; command: string; label: string }}
 */
const resolveGitleaksRunner = () => {
    const pathVersionResult = runProcess("gitleaks", ["version"]);

    if (pathVersionResult.status === 0) {
        return {
            arguments: [],
            command: "gitleaks",
            label:
                pathVersionResult.stdout.trim() ||
                pathVersionResult.stderr.trim() ||
                "gitleaks from PATH",
        };
    }

    const goVersionResult = runProcess("go", ["version"]);

    if (goVersionResult.status === 0) {
        return {
            arguments: ["run", gitleaksModule],
            command: "go",
            label: `gitleaks ${fallbackGitleaksVersion} via go run`,
        };
    }

    throw new Error(
        [
            "Gitleaks smoke tests require either gitleaks on PATH or Go for the pinned fallback.",
            pathVersionResult.stderr,
            goVersionResult.stderr,
        ]
            .filter(Boolean)
            .join("\n")
    );
};

const gitleaksRunner = resolveGitleaksRunner();

/**
 * Run Gitleaks through PATH or the pinned Go module fallback.
 *
 * @param {readonly string[]} argumentList
 *
 * @returns {import("node:child_process").SpawnSyncReturns<string>}
 */
const runGitleaks = (argumentList) =>
    runProcess(gitleaksRunner.command, [
        ...gitleaksRunner.arguments,
        ...argumentList,
    ]);

/**
 * Assert that Gitleaks accepts a source path.
 *
 * @param {string} sourcePath
 *
 * @returns {void}
 */
const assertCleanSource = (sourcePath) => {
    const result = runGitleaks([
        "detect",
        "--config",
        configPath,
        "--no-banner",
        "--no-git",
        "--redact",
        "--source",
        sourcePath,
    ]);

    if (result.status === 0) {
        return;
    }

    throw new Error(
        [
            `Expected source to pass Gitleaks: ${sourcePath}`,
            result.stdout,
            result.stderr,
        ]
            .filter(Boolean)
            .join("\n")
    );
};

/**
 * Assert that Gitleaks rejects a source path with the expected rule.
 *
 * @param {string} sourcePath
 * @param {string} expectedRule
 *
 * @returns {void}
 */
const assertLeakingSource = (sourcePath, expectedRule) => {
    const reportPath = path.join(fixtureDirectory, "gitleaks-report.json");
    const result = runGitleaks([
        "detect",
        "--config",
        configPath,
        "--exit-code",
        "1",
        "--no-banner",
        "--no-git",
        "--redact",
        "--report-format",
        "json",
        "--report-path",
        reportPath,
        "--source",
        sourcePath,
    ]);
    const output = `${result.stdout}\n${result.stderr}`;
    const report = existsSync(reportPath)
        ? JSON.parse(readFileSync(reportPath, "utf8"))
        : [];

    if (
        result.status === 1 &&
        report.some(
            /**
             * @param {{ RuleID?: string }} leak
             *
             * @returns {boolean}
             */
            (leak) => leak.RuleID === expectedRule
        )
    ) {
        return;
    }

    throw new Error(
        [`Expected source to fail with ${expectedRule}: ${sourcePath}`, output]
            .filter(Boolean)
            .join("\n")
    );
};

/**
 * Write a fixture into the smoke-test directory.
 *
 * @param {string} fileName
 * @param {string} content
 *
 * @returns {string}
 */
const writeFixture = (fileName, content) => {
    const fixturePath = path.join(fixtureDirectory, fileName);

    writeFileSync(fixturePath, content, "utf8");

    return fixturePath;
};

/**
 * Run native Gitleaks smoke tests for the packaged config.
 *
 * @returns {void}
 */
const main = () => {
    if (!existsSync(configPath)) {
        throw new Error(`Missing Gitleaks config: ${configPath}`);
    }

    rmSync(fixtureDirectory, { force: true, recursive: true });
    mkdirSync(fixtureDirectory, { recursive: true });

    try {
        assertCleanSource(configPath);
        assertCleanSource(
            writeFixture(
                "safe.env",
                [
                    "NPM_TOKEN=placeholder",
                    "VITE_PUBLIC_FLAG=true",
                    "",
                ].join("\n")
            )
        );
        assertLeakingSource(
            writeFixture(
                "leaking.env",
                [
                    [
                        "NPM_TOKEN",
                        [
                            "npm",
                            "secret",
                            "value",
                            "1234567890",
                        ].join("_"),
                    ].join("="),
                    "",
                ].join("\n")
            ),
            "nick2bad4u-sensitive-env-vars"
        );
    } finally {
        rmSync(fixtureDirectory, { force: true, recursive: true });
    }

    console.log(`${gitleaksRunner.label} smoke tests passed.`);
};

try {
    main();
} catch (error) {
    console.error(error);
    process.exitCode = 1;
}
