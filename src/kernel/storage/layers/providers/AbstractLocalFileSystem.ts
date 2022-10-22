import { KernelElement } from "../../../bases/KernelElement";
import {
  ILayerEntry,
  ILayerProvider,
  ILayerStat,
} from "../../types/ILayerProvider";
import fs from "fs";
import path from "path";
import { BasicError } from "../../../errors/BasicError";
export abstract class AbstractLocalFileSystem
  extends KernelElement
  implements ILayerProvider
{
  constructor(
    name: string,
    readonly id: string,
    readonly readonly: boolean,
    readonly localFolder: string,
    parent: KernelElement
  ) {
    super(name, parent);
  }

  async list(fullPath: string): Promise<ILayerEntry[]> {
    const realPath = path.join(this.localFolder, fullPath);
    if (!fs.existsSync(realPath)) {
      throw BasicError.notFound(this.fullName, "list", fullPath);
    }
    return fs
      .readdirSync(realPath, {
        encoding: "utf-8",
      })
      .map((item) => {
        return {
          path: path.join(fullPath, item),
          provider: this.id,
        };
      });
  }

  async readFile(fullPath: string): Promise<ILayerEntry<Buffer>> {
    const realPath = path.join(this.localFolder, fullPath);
    if (!fs.existsSync(realPath)) {
      throw BasicError.notFound(this.fullName, "readFile", fullPath);
    }
    const content = fs.readFileSync(realPath);
    return {
      path: fullPath,
      provider: this.id,
      body: content,
    };
  }

  async readTextFile(fullPath: string): Promise<ILayerEntry<string>> {
    const realPath = path.join(this.localFolder, fullPath);
    if (!fs.existsSync(realPath)) {
      throw BasicError.notFound(this.fullName, "readFile", realPath);
    }
    const content = fs.readFileSync(realPath, { encoding: "utf-8" });
    return {
      path: fullPath,
      provider: this.id,
      body: content,
    };
  }

  async writeTextFile(fullPath: string, body: string): Promise<boolean> {
    const realPath = path.join(this.localFolder, fullPath);

    fs.writeFileSync(realPath, body, { encoding: "utf-8" });
    return true;
  }

  async writeFile(
    fullPath: string,
    body: Buffer,
    encoding: BufferEncoding
  ): Promise<boolean> {
    const realPath = path.join(this.localFolder, fullPath);

    fs.writeFileSync(realPath, body, { encoding });
    return true;
  }

  async existsDirectory(folder: string): Promise<boolean> {
    const realDirectory = path.join(this.localFolder, folder);

    if (!fs.existsSync(realDirectory)) return false;
    if (!fs.statSync(realDirectory).isDirectory()) {
      throw BasicError.badQuery(
        this.fullName,
        "existsDirectory/not-a-directory",
        folder
      );
    }
    return true;
  }

  async existsFile(fullPath: string): Promise<boolean> {
    const realDirectory = path.join(this.localFolder, fullPath);

    if (!fs.existsSync(realDirectory)) return false;
    if (fs.statSync(realDirectory).isDirectory()) {
      throw BasicError.badQuery(
        this.fullName,
        "existsFile/not-a-file",
        fullPath
      );
    }
    return true;
  }

  async createDirectory(fullPath: string): Promise<boolean> {
    const realDirectory = path.join(this.localFolder, fullPath);

    if (fs.existsSync(realDirectory)) {
      throw BasicError.badQuery(
        this.fullName,
        "createDirectory/already-exists",
        fullPath
      );
    }
    if (fs.statSync(realDirectory).isDirectory()) {
      throw BasicError.badQuery(
        this.fullName,
        "existsFile/not-a-file",
        fullPath
      );
    }
    fs.mkdirSync(realDirectory);
    return true;
  }

  async stat(fullPath: string): Promise<ILayerStat> {
    const realDirectory = path.join(this.localFolder, fullPath);

    if (!fs.existsSync(realDirectory)) {
      throw BasicError.notFound(this.fullName, "stat", fullPath);
    }
    const stat = fs.statSync(realDirectory);
    return {
      path: fullPath,
      provider: this.id,
      body: stat,
    };
  }
}
