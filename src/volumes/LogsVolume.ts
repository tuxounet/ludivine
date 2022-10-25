import { bases, kernel } from "@ludivine/shared";
export class LogsVolume extends bases.StorageVolume {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super(
      "logs-volume",
      "logs",
      false,
      true,
      kernel.storage.createPathsDriver("local"),
      kernel.storage.createFileSystemDriver("local", {
        folder: "logs",
      }),
      kernel,
      parent
    );
  }
}
