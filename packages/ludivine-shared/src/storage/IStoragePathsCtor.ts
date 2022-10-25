import { IStoragePathsDriver } from "./IStoragePathsDriver";

export type IStoragePathsCtor = (
  props: Record<string, unknown>
) => IStoragePathsDriver;
