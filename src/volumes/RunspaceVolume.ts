import { kernel, storage } from "@ludivine/runtime";
export class RunspaceVolume extends storage.StorageVolume {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
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
          folder: "run/task",
        }),
      kernel,
      parent
    );
  }
}
