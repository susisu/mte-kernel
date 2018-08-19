"use strict";

const bsConfig = require("./bsconfig.json");
const bsModules = [
  "bs-platform",
  ...(bsConfig["bs-dependencies"] || []),
];

module.exports = {
  testMatch: [
    "**/__tests__/**/*test?(.bs).js"
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.js"
  ],
  transformIgnorePatterns: [
    `node_modules/(?!(${bsModules.join("|")})/)`
  ],
};
