#!/usr/bin/env node

import { Kernel } from "./kernel/kernel";
process.env.TZ = "Europe/Paris";
const args = process.argv.splice(2);
const kernel = new Kernel({
  nickname: "ludivine",
  cwdFolder: process.cwd(),
  entryPoint: __dirname,
});
kernel
  .run(args)
  .then((rc) => {
    console.info("INFO", "end with result", rc);
    process.exit(rc);
  })
  .catch((e) => {
    console.error("FATAL", e);
    process.exit(1);
  });
