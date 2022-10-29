const json = require("@rollup/plugin-json");
const typescript = require("@rollup/plugin-typescript");
const noderesolve = require("@rollup/plugin-node-resolve").default;
const commonjs = require("@rollup/plugin-commonjs").default;
module.exports.default = [
  {
    input: "src/index.ts",

    output: {
      file: "dist/index.js",
      format: "cjs",
    },
    plugins: [typescript(), commonjs(), noderesolve(), json()],
  },
];
