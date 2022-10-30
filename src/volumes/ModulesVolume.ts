import { kernel, storage } from "@ludivine/runtime";
export class ModulesVolume extends storage.StorageVolume {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super(
      "modules-volume",
      "modules",
      false,
      true,
      kernel.storage.createPathsDriver("local"),
      kernel.storage.createFileSystemDriver("local", {
        folder: "modules",
      }),
      kernel,
      parent
    );
  }
}
