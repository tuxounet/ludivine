import { kernel } from "@ludivine/types";
import { storage } from "@ludivine/abstractions";
export class LogsVolume extends storage.StorageVolume {
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
