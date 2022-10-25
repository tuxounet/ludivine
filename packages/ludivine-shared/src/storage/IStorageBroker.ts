import { IKernelElement } from "../kernel/IKernelElement";
import { IStorageFileSystemDriver } from "./IStorageFileSystemDriver";
import { IStoragePathsDriver } from "./IStoragePathsDriver";
import { IStorageVolume } from "./IStorageVolume";

export interface IStorageBroker extends IKernelElement {
  getVolume: (name: string) => Promise<IStorageVolume>;
  createPathsDriver: (
    name: string,
    params?: Record<string, unknown>
  ) => IStoragePathsDriver;

  createFileSystemDriver: (
    name: string,
    params?: Record<string, unknown>
  ) => IStorageFileSystemDriver;

  createEphemeralVolume: (
    paths: string,
    filesystem: string,
    config: Record<string, unknown>,
    parent: IKernelElement
  ) => Promise<IStorageVolume>;
}
