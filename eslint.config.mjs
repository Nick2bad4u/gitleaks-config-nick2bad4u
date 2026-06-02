import nickTwoBadFourU from "eslint-config-nick2bad4u";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nickTwoBadFourU.configs.all,
    {
        files: ["gitleaks.toml"],
        rules: {
            "toml/array-bracket-spacing": "off",
            "toml/array-element-newline": "off",
        },
    },
];

export default config;
