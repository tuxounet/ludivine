import { kernel, storage } from "@ludivine/runtime";
export class SessionsVolume extends storage.StorageVolume {
  constructor(
    prefix: string,
    readonly kernel: kernel.IKernel,
    parent: kernel.IKernelElement
  ) {
    super(
      "sessions-volume",
      "sessions",
      false,
      true,
      kernel.container
        .get<storage.IStorageBroker>("storage")
        .createPathsDriver("local"),
      kernel.container
        .get<storage.IStorageBroker>("storage")
        .createFileSystemDriver("local", {
          folder: prefix + "sessions",
        }),
      kernel,
      parent
    );
  }
}
