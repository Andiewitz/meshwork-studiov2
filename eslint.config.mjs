import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import security from "eslint-plugin-security";
import noSecrets from "eslint-plugin-no-secrets";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "*.config.*",
      "scripts/backup-db.sh",
      "scripts/backup-db.ps1",
      "server/public/**",
      "playwright-report/**",
      ".agent/**",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true, allowBoolean: true },
      ],
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: false },
      ],
    },
  },
  {
    files: ["tests/**/*.ts", "tests/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/unbound-method": "off",
    },
  },
  {
    plugins: {
      security,
      "no-secrets": noSecrets,
    },
    rules: {
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-possible-timing-attacks": "warn",
      "no-secrets/no-secrets": "error",
    },
  },
);
