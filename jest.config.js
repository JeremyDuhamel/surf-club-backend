module.exports = {
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.json",
    },
  },
  testEnvironment: "node",
  //   collectCoverageFrom: [
  //     "<rootDir>/**/*.{js,ts}",
  //     "!<rootDir>/jest.config.js",
  //     // "!<rootDir>/.prettierrc.js",
  //     // "!<rootDir>/build/**",
  //     "!<rootDir>/**/node_modules/**",
  //     "!<rootDir>/**/*.spec.*",
  //     "!<rootDir>/**/coverage/**",
  //     "!<rootDir>/**/documentation/**",
  //   ],
};
