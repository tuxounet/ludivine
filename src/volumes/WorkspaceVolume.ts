import { kernel, storage } from "@ludivine/runtime";
export class WorkspaceVolume extends storage.StorageVolume {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super(
      "workspace-volume",
      "workspace",
      false,
      true,
      kernel.container
        .get<storage.IStorageBroker>("storage")
        .createPathsDriver("local"),
      kernel.container
        .get<storage.IStorageBroker>("storage")
        .createFileSystemDriver("local", {
          folder: "run/home",
        }),
      kernel,
      parent
    );
  }
}
