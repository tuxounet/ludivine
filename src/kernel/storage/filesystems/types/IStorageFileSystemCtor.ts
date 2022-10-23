import { IStorageFileSystemDriver } from "./IStorageFileSystemDriver";

export type IStorageFileSystemCtor = (
  props: Record<string, unknown>
) => IStorageFileSystemDriver;
