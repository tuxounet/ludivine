import { IKernelElement } from "../../../shared/kernel/IKernelElement";
import { IStorageFileSystemDriver } from "../filesystems/types/IStorageFileSystemDriver";
import { IStoragePathsDriver } from "../paths/types/IStoragePathsDriver";

export interface IStorageVolume extends IKernelElement {
  id: string;
  readonly: boolean;
  ephemeral: boolean;
  paths: IStoragePathsDriver;
  fileSystem: IStorageFileSystemDriver;
}
