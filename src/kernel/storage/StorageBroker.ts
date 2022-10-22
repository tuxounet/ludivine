import path from "path";
import fs from "fs";

export class StorageBroker {
  combinePath(...pathParts: string[]): string {
    return path.join(...pathParts);
  }

  fileExtension(input: string): string {
    return path.extname(input);
  }

  async createTmpDirectory(): Promise<void> {
    const tmpPath = path.join(process.cwd(), "run") + path.sep;
  }
}
