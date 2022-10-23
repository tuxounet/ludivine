import { KernelElement } from "../shared/bases/KernelElement";
import { StorageVolume } from "../shared/bases/StorageVolume";
import { IKernel } from "../shared/kernel/IKernel";

export class WorkspaceVolume extends StorageVolume {
  constructor(readonly kernel: IKernel, parent: KernelElement) {
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
