import { StorageVolume } from "../shared/bases/StorageVolume";
import { IKernel } from "../shared/kernel/IKernel";
import { IKernelElement } from "../shared/kernel/IKernelElement";

export class LogsVolume extends StorageVolume {
  constructor(readonly kernel: IKernel, parent: IKernelElement) {
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
