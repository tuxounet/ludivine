import { kernel, storage } from "@ludivine/runtime";
export class ModulesVolume extends storage.StorageVolume {
  constructor(
    prefix: string,
    readonly kernel: kernel.IKernel,
    parent: kernel.IKernelElement
  ) {
    super(
      "modules-volume",
      "modules",
      false,
      true,
      kernel.container
        .get<storage.IStorageBroker>("storage")
        .createPathsDriver("local"),
      kernel.container
        .get<storage.IStorageBroker>("storage")
        .createFileSystemDriver("local", {
          folder: prefix + "modules",
        }),
      kernel,
      parent
    );
  }
}
