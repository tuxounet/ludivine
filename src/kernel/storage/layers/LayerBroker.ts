import { KernelElement } from "../../bases/KernelElement";
import { BasicError } from "../../errors/BasicError";
import { Kernel } from "../../kernel";
import {
  ILayerEntry,
  ILayerProvider,
  ILayerStat,
} from "../types/ILayerProvider";

export class LayerBroker extends KernelElement {
  constructor(readonly kernel: Kernel, parent: KernelElement) {
    super("storage-layers", parent);
    this.providers = [];
  }

  providers: ILayerProvider[];
  async list(path: string): Promise<ILayerEntry[]> {
    const allItems = await Promise.all(
      this.providers.map(async (item) => await item.list(path))
    );

    return allItems.flat();
  }

  async existsFile(provider: string, path: string): Promise<boolean> {
    const found = this.providers.find((item) => item.id === provider);
    if (found === undefined) {
      throw BasicError.notFound(this.fullName, "existsFile/provider", provider);
    }
    return await found.existsFile(path);
  }

  async existsDirectory(provider: string, path: string): Promise<boolean> {
    const found = this.providers.find((item) => item.id === provider);
    if (found === undefined) {
      throw BasicError.notFound(
        this.fullName,
        "existsDirectory/provider",
        provider
      );
    }
    return await found.existsDirectory(path);
  }

  async createDirectory(provider: string, path: string): Promise<boolean> {
    const found = this.providers.find((item) => item.id === provider);
    if (found === undefined) {
      throw BasicError.notFound(
        this.fullName,
        "createDirectory/provider",
        provider
      );
    }
    if (found.readonly) {
      throw BasicError.badQuery(
        this.fullName,
        "createDirectory/provider/readonly",
        provider
      );
    }
    return await found.createDirectory(path);
  }

  async stat(provider: string, path: string): Promise<ILayerStat> {
    const found = this.providers.find((item) => item.id === provider);
    if (found === undefined) {
      throw BasicError.notFound(this.fullName, "stat/provider", provider);
    }
    return await found.stat(path);
  }

  async readFile(provider: string, path: string): Promise<ILayerEntry<Buffer>> {
    const found = this.providers.find((item) => item.id === provider);
    if (found === undefined) {
      throw BasicError.notFound(this.fullName, "readFile/provider", provider);
    }
    return await found.readFile(path);
  }

  async writeFile(
    provider: string,
    path: string,
    buffer: Buffer,
    encoding: BufferEncoding
  ): Promise<boolean> {
    const found = this.providers.find((item) => item.id === provider);
    if (found === undefined) {
      throw BasicError.notFound(this.fullName, "writeFile/provider", provider);
    }
    if (found.readonly) {
      throw BasicError.badQuery(
        this.fullName,
        "writeFile/provider/readonly",
        provider
      );
    }
    return await found.writeFile(path, buffer, encoding);
  }
}
