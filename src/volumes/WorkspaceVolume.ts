import { StorageVolume } from "../shared/bases/StorageVolume";
import { IKernel } from "../shared/kernel/IKernel";
import { IKernelElement } from "../shared/kernel/IKernelElement";

export class WorkspaceVolume extends StorageVolume {
  constructor(readonly kernel: IKernel, parent: IKernelElement) {
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
