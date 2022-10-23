import { KernelElement } from "../../../shared/bases/KernelElement";
import { BasicError } from "../../../shared/errors/BasicError";
import { StoragesBroker } from "../StoragesBroker";
import { LocalPathDriver } from "./drivers/LocalPathDriver";
import { IStoragePathsCtor } from "../../../shared/storage/IStoragePathsCtor";
import { IKernel } from "../../../shared/kernel/IKernel";
import { IStoragePathsDriver } from "../../../shared/storage/IStoragePathsDriver";

export class StoragePathsFactory extends KernelElement {
  constructor(readonly kernel: IKernel, parent: StoragesBroker) {
    super("storage-paths", kernel, parent);
    this.providers = new Map();
    this.drivers = new Set();
  }

  providers: Map<string, IStoragePathsCtor>;
  drivers: Set<IStoragePathsDriver>;

  async initialize(): Promise<void> {
    this.providers.clear();
    this.providers.set(
      "local",
      (props) => new LocalPathDriver(props, this.kernel, this)
    );
    this.drivers.clear();
  }

  async shutdown(): Promise<void> {
    await Promise.all(
      Array.from(this.drivers.values()).map(
        async (item) => await item.shutdown()
      )
    );
  }

  getOneDriver<
    T extends IStoragePathsDriver,
    TProps extends Record<string, unknown>
  >(id: string, props: TProps): T {
    const driver = this.providers.get(id);
    if (driver == null)
      throw BasicError.notFound(this.fullName, "getOneDriver/provider", id);
    const instance = driver(props);
    return instance as T;
  }
}
