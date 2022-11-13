import { kernel, storage } from "@ludivine/runtime";
export class RunspaceVolume extends storage.StorageVolume {
  constructor(
    prefix: string,
    readonly kernel: kernel.IKernel,
    parent: kernel.IKernelElement
  ) {
    super(
      "runspace-volume",
      "runspace",
      false,
      true,
      kernel.container
        .get<storage.IStorageBroker>("storage")
        .createPathsDriver("local"),
      kernel.container
        .get<storage.IStorageBroker>("storage")
        .createFileSystemDriver("local", {
          folder: prefix + "task",
        }),
      kernel,
      parent
    );
  }
}
