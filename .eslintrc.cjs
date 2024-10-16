module.exports = {
  root: true,
  extends: ["@storybook/eslint-config-storybook", "plugin:storybook/recommended"],
  rules: {
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "eslint-comments/disable-enable-pair": "off",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "import/named": "off", // TODO reenable when we update to CPC (revert PR #338)
    "import/order": "off",
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    "@typescript-eslint/ban-ts-comment": [
      "error",
      {
        "ts-expect-error": "allow-with-description",
        "ts-ignore": "allow-with-description",
        "ts-nocheck": "allow-with-description",
        "ts-check": "allow-with-description",
        minimumDescriptionLength: 3,
      },
    ],
    "jest/no-deprecated-functions": "off",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
  },
  plugins: ["simple-import-sort"],
};
