import { IStorageFileSystemDriver } from "../storage/filesystems/types/IStorageFileSystemDriver";
import { IStoragePathsDriver } from "../storage/paths/types/IStoragePathsDriver";
import { IStorageVolume } from "../storage/types/IStorageVolume";
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
    parent: KernelElement
  ) {
    super(name, parent);
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
