import { bases, kernel, storage, errors, logging } from "@ludivine/runtime";
import { LocalFileSystemDriver } from "./drivers/LocalFileSystemDriver";
export class StorageFileSystemsFactory extends bases.KernelElement {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("storage-filesystems", kernel, parent);
    this.providers = new Map();
    this.drivers = new Set();
  }

  providers: Map<string, storage.IStorageFileSystemCtor>;

  drivers: Set<storage.IStorageFileSystemDriver>;
  @logging.logMethod()
  async initialize(): Promise<void> {
    this.providers.clear();
    this.providers.set(
      "local",
      (props) => new LocalFileSystemDriver(props, this.kernel, this)
    );
    this.drivers.clear();
    await super.initialize();
  }
  @logging.logMethod()
  async shutdown(): Promise<void> {
    await super.shutdown();
  }

  getOneDriver<
    T extends storage.IStorageFileSystemDriver,
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
