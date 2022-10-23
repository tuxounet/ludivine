import { RunspaceVolume } from "../../volumes/RunspaceVolume";
import { WorkspaceVolume } from "../../volumes/WorkspaceVolume";
import { KernelElement } from "../../shared/bases/KernelElement";
import { BasicError } from "../../shared/errors/BasicError";
import { StorageFileSystemsFactory } from "./filesystems/StorageFileSystemsFactory";
import { StoragePathsFactory } from "./paths/StoragePathsFactory";
import { IStorageVolume } from "../../shared/storage/IStorageVolume";
import { IKernel } from "../../shared/kernel/IKernel";
import { IStorageBroker } from "../../shared/storage/IStorageBroker";
import { IStoragePathsDriver } from "../../shared/storage/IStoragePathsDriver";
import { IStorageFileSystemDriver } from "../../shared/storage/IStorageFileSystemDriver";
import { LogsVolume } from "../../volumes/LogsVolume";

export class StoragesBroker extends KernelElement implements IStorageBroker {
  fileSystemsFactory: StorageFileSystemsFactory;
  pathsFactory: StoragePathsFactory;
  volumes: Map<string, IStorageVolume>;
  constructor(readonly kernel: IKernel) {
    super("storage", kernel);
    this.fileSystemsFactory = new StorageFileSystemsFactory(this.kernel, this);
    this.pathsFactory = new StoragePathsFactory(this.kernel, this);
    this.volumes = new Map();
  }

  createPathsDriver(
    name: string,
    params?: Record<string, unknown>
  ): IStoragePathsDriver {
    return this.pathsFactory.getOneDriver(name, params != null ? params : {});
  }

  createFileSystemDriver(
    name: string,
    params?: Record<string, unknown>
  ): IStorageFileSystemDriver {
    return this.fileSystemsFactory.getOneDriver(
      name,
      params != null ? params : {}
    );
  }

  async initialize(): Promise<void> {
    await this.pathsFactory.initialize();
    await this.fileSystemsFactory.initialize();
    const logsVolume = new LogsVolume(this.kernel, this);
    this.volumes.set(logsVolume.id, logsVolume);
    const runspaceVolume = new RunspaceVolume(this.kernel, this);
    this.volumes.set(runspaceVolume.id, runspaceVolume);
    const workspaceVolume = new WorkspaceVolume(this.kernel, this);
    this.volumes.set(workspaceVolume.id, workspaceVolume);
    await this.mountAll();
  }

  mountAll = async (): Promise<void> => {
    await Promise.all(
      Array.from(this.volumes.values()).map(
        async (item) => await item.initialize()
      )
    );
  };

  unmountAll = async (): Promise<void> => {
    await Promise.all(
      Array.from(this.volumes.values()).map(
        async (item) => await item.shutdown()
      )
    );
  };

  getVolume = async (id: string): Promise<IStorageVolume> => {
    const volume = this.volumes.get(id);
    if (volume == null)
      throw BasicError.notFound(this.fullName, "getVolume", id);
    return volume;
  };

  async shutdown(): Promise<void> {
    await this.unmountAll();
    await this.fileSystemsFactory.shutdown();
    await this.pathsFactory.shutdown();
  }
}
