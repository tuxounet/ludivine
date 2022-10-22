#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const childProc = require("child_process");

const ludivinePackageJsonFile = path.resolve(__dirname, "..", "package.json");
const ludivinePackageJson = JSON.parse(
  fs.readFileSync(ludivinePackageJsonFile, { encoding: "utf-8" })
);

console.info(`Ludivine ${ludivinePackageJson.version}`);

const ps = childProc.exec("npm exec --yes ts-node " + ludivinePackageJson.main);
process.stdin.pipe(ps.stdin);
ps.stdout.pipe(process.stdout);

ps.on("exit", (code) => {
  console.info("ended with code", code);
  process.exit(code);
});
ps.on("error", (err) => {
  console.error("ended with error", err);
  process.exit(1);
});
