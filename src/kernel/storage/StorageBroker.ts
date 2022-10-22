import path from "path";
import fs from "fs";

export class StorageBroker {
  combinePath(...pathParts: string[]) {
    return path.join(...pathParts);
  }

  fileExtension(input: string) {
    return path.extname(input);
  }

  createTmpDirectory() {
    const tmpPath = path.join(process.cwd(), "run") + path.sep;
  }
}
