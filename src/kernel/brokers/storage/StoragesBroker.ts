import { bases, storage, errors, logging, kernel } from "@ludivine/runtime";
import { LogsVolume } from "../../../volumes/LogsVolume";
import { ModulesVolume } from "../../../volumes/ModulesVolume";
import { RunspaceVolume } from "../../../volumes/RunspaceVolume";
import { WorkspaceVolume } from "../../../volumes/WorkspaceVolume";

import { StorageFileSystemsFactory } from "./filesystems/StorageFileSystemsFactory";
import { StoragePathsFactory } from "./paths/StoragePathsFactory";

export class StoragesBroker
  extends bases.KernelElement
  implements storage.IStorageBroker
{
  fileSystemsFactory: StorageFileSystemsFactory;
  pathsFactory: StoragePathsFactory;
  volumes: Map<string, storage.IStorageVolume>;
  constructor(readonly kernel: kernel.IKernel) {
    super("storage", kernel);
    this.fileSystemsFactory = new StorageFileSystemsFactory(this.kernel, this);
    this.pathsFactory = new StoragePathsFactory(this.kernel, this);
    this.volumes = new Map();
  }

  @logging.logMethod()
  async initialize(): Promise<void> {
    await this.pathsFactory.initialize();
    await this.fileSystemsFactory.initialize();
    const logsVolume = new LogsVolume(this.kernel, this);
    this.volumes.set(logsVolume.id, logsVolume);
    const modulesVolume = new ModulesVolume(this.kernel, this);
    this.volumes.set(modulesVolume.id, modulesVolume);
    const runspaceVolume = new RunspaceVolume(this.kernel, this);
    this.volumes.set(runspaceVolume.id, runspaceVolume);
    const workspaceVolume = new WorkspaceVolume(this.kernel, this);
    this.volumes.set(workspaceVolume.id, workspaceVolume);
    await this.mountAll();
  }

  @logging.logMethod()
  async shutdown(): Promise<void> {
    await this.unmountAll();
    await this.fileSystemsFactory.shutdown();
    await this.pathsFactory.shutdown();
  }

  createPathsDriver(
    name: string,
    params?: Record<string, unknown>
  ): storage.IStoragePathsDriver {
    return this.pathsFactory.getOneDriver(name, params != null ? params : {});
  }

  createFileSystemDriver(
    name: string,
    params?: Record<string, unknown>
  ): storage.IStorageFileSystemDriver {
    return this.fileSystemsFactory.getOneDriver(
      name,
      params != null ? params : {}
    );
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

  getVolume = async (id: string): Promise<storage.IStorageVolume> => {
    const volume = this.volumes.get(id);
    if (volume == null)
      throw errors.BasicError.notFound(this.fullName, "getVolume", id);
    return volume;
  };

  createEphemeralVolume = async (
    paths: string,
    filesystem: string,
    config: Record<string, unknown>,
    parent: kernel.IKernelElement
  ): Promise<storage.IStorageVolume> => {
    const pathsDriver = this.createPathsDriver(paths, config);
    const filesystemDriver = this.createFileSystemDriver(filesystem, config);

    const ephVolume = new storage.StorageVolume(
      "eph",
      "eph",
      false,
      true,
      pathsDriver,
      filesystemDriver,
      this.kernel,
      parent
    );
    this.volumes.set(ephVolume.id, ephVolume);

    return ephVolume;
  };
}
