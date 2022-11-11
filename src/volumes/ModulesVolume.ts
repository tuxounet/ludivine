import { kernel, storage } from "@ludivine/runtime";
export class ModulesVolume extends storage.StorageVolume {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
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
          folder: "run/modules",
        }),
      kernel,
      parent
    );
  }
}
