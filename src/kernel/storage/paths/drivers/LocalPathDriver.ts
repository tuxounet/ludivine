import path from "path";
import { IKernelElement } from "../../../../shared/kernel/IKernelElement";
import { IKernel } from "../../../../shared/kernel/IKernel";
import { KernelElement } from "../../../../shared/bases/KernelElement";
import { IStoragePathsDriver } from "../../../../shared/storage/IStoragePathsDriver";

export class LocalPathDriver
  extends kernel.KernelElement
  implements IStoragePathsDriver
{
  constructor(
    readonly properties: Record<string, unknown>,
    readonly kernel: kernel.IKernel,
    readonly parent: IKernelElement
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
