import { bases, kernel } from "@ludivine/shared";

export class WorkspaceVolume extends bases.StorageVolume {
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
