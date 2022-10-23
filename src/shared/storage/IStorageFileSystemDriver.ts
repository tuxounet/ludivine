import type { Stats } from "fs";
import { IKernelElement } from "../kernel/IKernelElement";

export interface IStorageFileSystemDriverEntry<T = Record<string, unknown>> {
  path: string;
  provider: string;
  body?: T;
}

export interface IStorageFileSystemDriverStat
  extends IStorageFileSystemDriverEntry<Stats> {}

export interface IStorageFileSystemDriver extends IKernelElement {
  readonly id: string;
  properties: Record<string, unknown>;
  // bind: () => Promise<boolean>;
  // unbind: () => Promise<boolean>;
  list: (path: string) => Promise<IStorageFileSystemDriverEntry[]>;
  existsFile: (path: string) => Promise<boolean>;
  createDirectory: (path: string) => Promise<boolean>;
  createTempDirectory: () => Promise<string>;
  existsDirectory: (path: string) => Promise<boolean>;
  stat: (path: string) => Promise<IStorageFileSystemDriverStat>;
  getRealPath: (path: string) => Promise<string>;
  getRelativePath: (path: string) => Promise<string>;
  readTextFile: (
    path: string
  ) => Promise<IStorageFileSystemDriverEntry<string>>;
  readFile: (path: string) => Promise<IStorageFileSystemDriverEntry<Buffer>>;
  writeTextFile: (path: string, body: string) => Promise<boolean>;
  writeFile: (path: string, body: Buffer) => Promise<boolean>;
  appendFile: (path: string, body: Buffer) => Promise<boolean>;
  deleteFile: (path: string) => Promise<boolean>;
  deleteDirectory: (path: string) => Promise<boolean>;
}
