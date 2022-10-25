import path from "path";
import { bases, kernel, storage } from "@ludivine/shared";

export class LocalPathDriver
  extends bases.KernelElement
  implements storage.IStoragePathsDriver
{
  constructor(
    readonly properties: Record<string, unknown>,
    readonly kernel: kernel.IKernel,
    readonly parent: kernel.IKernelElement
  ) {
    super("local-path", kernel, parent);
    this.id = "local";
    this.sep = path.sep;
  }

  sep: string;
  id: string;
  combinePaths(...parts: string[]): string {
    return path.join(...parts);
  }

  fileExtension(filePart: string): string {
    return path.extname(filePart);
  }
}
