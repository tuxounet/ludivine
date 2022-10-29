import { Kernel } from "./kernel/kernel";

const kernel = new Kernel("0.0");
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
