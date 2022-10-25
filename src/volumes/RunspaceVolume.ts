import { StorageVolume } from "../shared/bases/StorageVolume";
import { IKernel } from "../shared/kernel/IKernel";
import { IKernelElement } from "../shared/kernel/IKernelElement";

export class RunspaceVolume extends StorageVolume {
  constructor(readonly kernel: kernel.IKernel, parent: IKernelElement) {
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
