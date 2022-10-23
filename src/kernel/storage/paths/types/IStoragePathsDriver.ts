import { IKernelElement } from "../../../bases/KernelElement";

export interface IStoragePathsDriver extends IKernelElement {
  id: string;
  combinePaths: (...parts: string[]) => string;
  fileExtension: (filePart: string) => string;
}
