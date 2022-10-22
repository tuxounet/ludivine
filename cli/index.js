#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ludivinePackageJsonFile = path.resolve(__dirname, "..", "package.json");
const ludivinePackageJson = JSON.parse(
  fs.readFileSync(ludivinePackageJsonFile, { encoding: "utf-8" })
);

console.log(`Awesome Command ${ludivinePackageJson.version}`);
