import { Stats } from "fs";
export interface ILayerEntry<T = Record<string, unknown>> {
  path: string;
  provider: string;
  body?: T;
}

export interface ILayerStat extends ILayerEntry<Stats> {}

export interface ILayerProvider {
  readonly id: string;
  readonly: boolean;
  list: (path: string) => Promise<ILayerEntry[]>;
  existsFile: (path: string) => Promise<boolean>;
  createDirectory: (path: string) => Promise<boolean>;
  existsDirectory: (path: string) => Promise<boolean>;
  stat: (path: string) => Promise<ILayerStat>;
  readTextFile: (path: string) => Promise<ILayerEntry<string>>;
  readFile: (path: string) => Promise<ILayerEntry<Buffer>>;
  writeTextFile: (path: string, body: string) => Promise<boolean>;
  writeFile: (
    path: string,
    body: Buffer,
    encoding: BufferEncoding
  ) => Promise<boolean>;
}
