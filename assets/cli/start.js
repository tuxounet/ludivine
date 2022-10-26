#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

const ludivineCodePath = path.resolve(__dirname);
const ludivinePackageJsonFile = path.resolve(ludivineCodePath, "package.json");
const ludivinePackageJson = JSON.parse(
  fs.readFileSync(ludivinePackageJsonFile, { encoding: "utf-8" })
);

const ludivineEntryPoint = path.resolve(ludivineCodePath, "dist", "index");
console.info(`Ludivine ${ludivinePackageJson.version} @ ${ludivineEntryPoint}`);
require(ludivineEntryPoint);
