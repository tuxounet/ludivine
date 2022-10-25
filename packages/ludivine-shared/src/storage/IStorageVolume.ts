import { IKernelElement } from "../kernel/IKernelElement";
import { IStorageFileSystemDriver } from "./IStorageFileSystemDriver";

import { IStoragePathsDriver } from "./IStoragePathsDriver";

export interface IStorageVolume extends IKernelElement {
  id: string;
  readonly: boolean;
  ephemeral: boolean;
  paths: IStoragePathsDriver;
  fileSystem: IStorageFileSystemDriver;
}
