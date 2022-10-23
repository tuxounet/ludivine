import { IKernelElement } from "../../bases/KernelElement";
import { IStorageFileSystemDriver } from "../filesystems/types/IStorageFileSystemDriver";
import { IStoragePathsDriver } from "../paths/types/IStoragePathsDriver";

export interface IStorageVolume extends IKernelElement {
  id: string;
  readonly: boolean;
  ephemeral: boolean;
  paths: IStoragePathsDriver;
  fileSystem: IStorageFileSystemDriver;
}
