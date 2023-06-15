module.exports = {
  root: true,
  extends: ["@storybook/eslint-config-storybook"],
  rules: {
    "no-use-before-define": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "eslint-comments/disable-enable-pair": "off",
    "import/no-extraneous-dependencies": "off",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
  },
};
