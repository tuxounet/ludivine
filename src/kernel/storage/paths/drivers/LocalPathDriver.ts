import { KernelElement } from "../../../../shared/bases/KernelElement";
import path from "path";
import { IStoragePathsDriver } from "../../../../shared/storage/IStoragePathsDriver";
import { IKernel } from "../../../../shared/kernel/IKernel";

export class LocalPathDriver
  extends KernelElement
  implements IStoragePathsDriver
{
  constructor(
    readonly properties: Record<string, unknown>,
    readonly kernel: IKernel,
    readonly parent: KernelElement
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
