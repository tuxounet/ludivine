#!/usr/bin/env node

import { Kernel } from "./kernel/kernel";

const kernel = new Kernel(__dirname);
kernel
  .run()
  .then((rc) => {
    console.info("INFO", "end with result", rc);
    process.exit(rc);
  })
  .catch((e) => {
    console.error("FATAL", e);
    process.exit(1);
  });
