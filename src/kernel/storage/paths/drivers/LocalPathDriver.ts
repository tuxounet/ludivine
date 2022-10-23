import { KernelElement } from "../../../bases/KernelElement";
import { IStoragePathsDriver } from "../types/IStoragePathsDriver";
import path from "path";
export class LocalPathDriver
  extends KernelElement
  implements IStoragePathsDriver
{
  constructor(
    readonly properties: Record<string, unknown>,
    readonly parent: KernelElement
  ) {
    super("local-path", parent);
    this.id = "local";
  }

  id: string;
  combinePaths(...parts: string[]): string {
    return path.resolve(...parts);
  }

  fileExtension(filePart: string): string {
    return path.extname(filePart);
  }
}
