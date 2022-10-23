import { Kernel } from "./kernel/kernel";
import pkgJson from "../package.json";
const kernel = new Kernel(pkgJson.version);
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
