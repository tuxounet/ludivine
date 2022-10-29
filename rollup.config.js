const typescript = require("@rollup/plugin-typescript");
const json = require("@rollup/plugin-json");
module.exports.default = [
  {
    input: "src/index.ts",

    output: {
      file: "dist/index.js",
      format: "cjs",
    },
    plugins: [typescript(), json()],
  },
];
