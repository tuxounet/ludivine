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
const startCmd = 'npm exec --yes ts-node "' + ludivineMainEntryPoint + '"';
const startCwd = process.cwd();
console.debug("lauching", startCmd, "inside", startCwd);
const ps = childProc.exec(startCmd, {
  encoding: "utf-8",
  cwd: startCwd,
});
process.stdin.pipe(ps.stdin);
ps.stdout.pipe(process.stdout);
ps.on("error", (err) => {
  console.error("ended with error", err);
  process.exit(1);
});

ps.on("exit", (code) => {
  console.info("ended with code", code);
  process.exit(code);
});
