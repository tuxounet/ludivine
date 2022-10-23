import { KernelElement } from "../kernel/bases/KernelElement";
import { StorageVolume } from "../kernel/bases/StorageVolume";
import { Kernel } from "../kernel/kernel";

export class RunspaceVolume extends StorageVolume {
  constructor(readonly kernel: Kernel, parent: KernelElement) {
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
