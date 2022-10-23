import { IStorageFileSystemDriver } from "../../kernel/storage/filesystems/types/IStorageFileSystemDriver";
import { IStoragePathsDriver } from "../../kernel/storage/paths/types/IStoragePathsDriver";
import { IStorageVolume } from "../../kernel/storage/types/IStorageVolume";
import { IKernel } from "../kernel/IKernel";
import { KernelElement } from "./KernelElement";

export abstract class StorageVolume
  extends KernelElement
  implements IStorageVolume
{
  constructor(
    name: string,
    readonly id: string,
    readonly readonly: boolean,
    readonly ephemeral: boolean,
    readonly paths: IStoragePathsDriver,
    readonly fileSystem: IStorageFileSystemDriver,
    readonly kernel: IKernel,
    parent: KernelElement
  ) {
    super(name, kernel, parent);
  }

  async initialize(): Promise<void> {
    await this.paths.initialize();
    await this.fileSystem.initialize();
  }

  async shutdown(): Promise<void> {
    await this.fileSystem.shutdown();
    await this.paths.shutdown();
  }
}
