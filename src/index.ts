#!/usr/bin/env node

import { Kernel } from "./kernel/kernel";

const kernel = new Kernel({
  nickname: "ludivine",
  cwdFolder: process.cwd(),
  entryPoint: __dirname,
});
kernel
  .run(process.argv)
  .then((rc) => {
    console.info("INFO", "end with result", rc);
    process.exit(rc);
  })
  .catch((e) => {
    console.error("FATAL", e);
    process.exit(1);
  });
