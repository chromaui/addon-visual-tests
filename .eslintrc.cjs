module.exports = {
  root: true,
  extends: ["@storybook/eslint-config-storybook"],
  rules: {
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "eslint-comments/disable-enable-pair": "off",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
  },
  plugins: ["simple-import-sort"],
};
