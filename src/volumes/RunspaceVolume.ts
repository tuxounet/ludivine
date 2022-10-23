import { KernelElement } from "../shared/bases/KernelElement";
import { StorageVolume } from "../shared/bases/StorageVolume";
import { IKernel } from "../shared/kernel/IKernel";

export class RunspaceVolume extends StorageVolume {
  constructor(readonly kernel: IKernel, parent: KernelElement) {
    super(
      "runspace-volume",
      "runspace",
      false,
      true,
      kernel.storage.pathsFactory.getOneDriver("local", {}),
      kernel.storage.fileSystemsFactory.getOneDriver("local", {
        folder: "run",
      }),
      parent
    );
  }
}
