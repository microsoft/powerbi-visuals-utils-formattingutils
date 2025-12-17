import powerbiVisualsConfigs from "eslint-plugin-powerbi-visuals";

export default [
    powerbiVisualsConfigs.configs.recommended,
    {
        ignores: ["node_modules/**", "dist/**", ".vscode/**", ".tmp/**", ".github/**", "coverage/**", "lib/**", ".eslintrc.js", "karma.conf.ts", "webpack.config.js", "globalize/**", "test/**", "**/dateFormatter.ts", "**/numberFormatter.ts", "**/localStorageService.ts"],
    },
];