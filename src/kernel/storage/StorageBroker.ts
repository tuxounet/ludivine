import path from "path";
import fs from "fs";
import { KernelElement } from "../bases/KernelElement";
import { LayerBroker } from "./layers/LayerBroker";
import { Kernel } from "../kernel";

export class StorageBroker extends KernelElement {
  layers: LayerBroker;
  constructor(readonly kernel: Kernel) {
    super("storage", kernel);
    this.layers = new LayerBroker(kernel, this);
  }

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
