import { RunspaceVolume } from "../../volumes/RunspaceVolume";
import { WorkspaceVolume } from "../../volumes/WorkspaceVolume";
import { KernelElement } from "../bases/KernelElement";
import { BasicError } from "../errors/BasicError";
import { Kernel } from "../kernel";
import { StorageFileSystemsFactory } from "./filesystems/StorageFileSystemsFactory";
import { StoragePathsFactory } from "./paths/StoragePathsFactory";
import { IStorageVolume } from "./types/IStorageVolume";

export class StoragesBroker extends KernelElement {
  fileSystemsFactory: StorageFileSystemsFactory;
  pathsFactory: StoragePathsFactory;
  volumes: Map<string, IStorageVolume>;
  constructor(readonly kernel: Kernel) {
    super("storage", kernel);
    this.fileSystemsFactory = new StorageFileSystemsFactory(this);
    this.pathsFactory = new StoragePathsFactory(this);
    this.volumes = new Map();
  }

  async initialize(): Promise<void> {
    await this.pathsFactory.initialize();
    await this.fileSystemsFactory.initialize();

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
