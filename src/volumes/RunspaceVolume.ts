import { bases, kernel } from "@ludivine/shared";
export class RunspaceVolume extends bases.StorageVolume {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super(
      "runspace-volume",
      "runspace",
      false,
      true,
      kernel.storage.createPathsDriver("local"),
      kernel.storage.createFileSystemDriver("local", {
        folder: "run",
      }),
      kernel,
      parent
    );
  }
}
