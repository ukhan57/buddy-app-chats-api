import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      ecmaVersion: 'latest',
      globals: {
        ...globals.node, // Use the node globals
        // Add any other global variables you might need
      },
    },
  },
  pluginJs.configs.recommended,
];
