import { KernelElement } from "../../../shared/bases/KernelElement";
import { BasicError } from "../../../shared/errors/BasicError";
import { StoragesBroker } from "../StoragesBroker";
import { LocalFileSystemDriver } from "./drivers/LocalFileSystemDriver";
import { IStorageFileSystemCtor } from "../../../shared/storage/IStorageFileSystemCtor";

import { IKernel } from "../../../shared/kernel/IKernel";
import { IStorageFileSystemDriver } from "../../../shared/storage/IStorageFileSystemDriver";

export class StorageFileSystemsFactory extends KernelElement {
  constructor(readonly kernel: IKernel, parent: StoragesBroker) {
    super("storage-filesystems", kernel, parent);
    this.providers = new Map();
    this.drivers = new Set();
  }

  providers: Map<string, IStorageFileSystemCtor>;

  drivers: Set<IStorageFileSystemDriver>;

  async initialize(): Promise<void> {
    this.providers.clear();
    this.providers.set(
      "local",
      (props) => new LocalFileSystemDriver(props, this.kernel, this)
    );
    this.drivers.clear();
  }

  async shutdown(): Promise<void> {}

  getOneDriver<
    T extends IStorageFileSystemDriver,
    TProps extends Record<string, unknown>
  >(id: string, props: TProps): T {
    const driver = this.providers.get(id);
    if (driver == null)
      throw BasicError.notFound(this.fullName, "getOneDriver/provider", id);
    const instance = driver(props);
    return instance as T;
  }
}
