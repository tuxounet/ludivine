import { kernel, storage } from "@ludivine/types";
import { LocalPathDriver } from "./drivers/LocalPathDriver";
import { bases, errors } from "@ludivine/abstractions";
export class StoragePathsFactory extends bases.KernelElement {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("storage-paths", kernel, parent);
    this.providers = new Map();
    this.drivers = new Set();
  }

  providers: Map<string, storage.IStoragePathsCtor>;
  drivers: Set<storage.IStoragePathsDriver>;

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
    T extends storage.IStoragePathsDriver,
    TProps extends Record<string, unknown>
  >(id: string, props: TProps): T {
    const driver = this.providers.get(id);
    if (driver == null)
      throw errors.BasicError.notFound(
        this.fullName,
        "getOneDriver/provider",
        id
      );
    const instance = driver(props);
    return instance as T;
  }
}
