import { KernelElement } from "../shared/bases/KernelElement";
import { StorageVolume } from "../shared/bases/StorageVolume";
import { Kernel } from "../kernel/kernel";

export class WorkspaceVolume extends StorageVolume {
  constructor(readonly kernel: Kernel, parent: KernelElement) {
    super(
      "workspace-volume",
      "workspace",
      false,
      true,
      kernel.storage.pathsFactory.getOneDriver("local", {}),
      kernel.storage.fileSystemsFactory.getOneDriver("local", {
        folder: "home",
      }),
      parent
    );
  }
}
