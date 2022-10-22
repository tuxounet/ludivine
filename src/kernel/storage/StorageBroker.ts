import path from "path";
import fs from "fs";

export class StorageBroker {
  combinePath(...pathParts: string[]): string {
    return path.join(...pathParts);
  }

  fileExtension(input: string): string {
    return path.extname(input);
  }

  async createTmpDirectory(): Promise<string> {
    const tmpPath = path.join(process.cwd(), "run") + path.sep;
    const tmpDir = await fs.promises.mkdtemp(tmpPath);
    return this.combinePath(tmpPath, tmpDir);
  }
}
