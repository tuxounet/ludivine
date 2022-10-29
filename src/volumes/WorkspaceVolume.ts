import { kernel, storage } from "@ludivine/runtime";
export class WorkspaceVolume extends storage.StorageVolume {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super(
      "workspace-volume",
      "workspace",
      false,
      true,
      kernel.storage.createPathsDriver("local"),
      kernel.storage.createFileSystemDriver("local", {
        folder: "home",
      }),
      kernel,
      parent
    );
  }
}
