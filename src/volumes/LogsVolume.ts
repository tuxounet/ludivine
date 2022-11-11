import { kernel, storage } from "@ludivine/runtime";
export class LogsVolume extends storage.StorageVolume {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super(
      "logs-volume",
      "logs",
      false,
      true,
      kernel.container
        .get<storage.IStorageBroker>("storage")
        .createPathsDriver("local"),
      kernel.container
        .get<storage.IStorageBroker>("storage")
        .createFileSystemDriver("local", {
          folder: "run/logs",
        }),
      kernel,
      parent
    );
  }
}
