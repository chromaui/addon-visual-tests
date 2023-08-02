module.exports = {
  root: true,
  extends: ["@storybook/eslint-config-storybook", "plugin:storybook/recommended"],
  rules: {
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "eslint-comments/disable-enable-pair": "off",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "import/order": "off",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"]
  },
  plugins: ["simple-import-sort"]
};