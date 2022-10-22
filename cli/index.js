#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const childProc = require("child_process");

const ludivineCodePath = path.resolve(__dirname, "..");
const ludivinePackageJsonFile = path.resolve(ludivineCodePath, "package.json");
const ludivinePackageJson = JSON.parse(
  fs.readFileSync(ludivinePackageJsonFile, { encoding: "utf-8" })
);
const ludivineMainEntryPoint = path.resolve(
  ludivineCodePath,
  ludivinePackageJson.main
);

console.info(`Ludivine ${ludivinePackageJson.version}`);

const ps = childProc.exec("npm exec --yes ts-node " + ludivineMainEntryPoint, {
  encoding: "utf-8",
  cwd: process.cwd(),
});
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
