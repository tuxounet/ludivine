import fs from "fs";
import path from "path";
import { KernelElement } from "../../../../shared/bases/KernelElement";
import { BasicError } from "../../../../shared/errors/BasicError";
import { IKernel } from "../../../../shared/kernel/IKernel";

import {
  IStorageFileSystemDriver,
  IStorageFileSystemDriverEntry,
  IStorageFileSystemDriverStat,
} from "../types/IStorageFileSystemDriver";

export interface LocalFileSystemDriverProperties
  extends Record<string, unknown> {
  localFolder: string;
}

export class LocalFileSystemDriver
  extends KernelElement
  implements IStorageFileSystemDriver
{
  id: string;

  constructor(
    readonly properties: Record<string, unknown>,
    readonly kernel: IKernel,
    parent: KernelElement
  ) {
    super("local-fs", kernel, parent);
    this.id = "local";
  }

  async bind(): Promise<boolean> {
    return true;
  }

  async unbind(): Promise<boolean> {
    return true;
  }

  async list(fullPath: string): Promise<IStorageFileSystemDriverEntry[]> {
    const realPath = await this.getRealPath(fullPath);
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

  async readFile(
    fullPath: string
  ): Promise<IStorageFileSystemDriverEntry<Buffer>> {
    const realPath = await this.getRealPath(fullPath);
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

  async readTextFile(
    fullPath: string
  ): Promise<IStorageFileSystemDriverEntry<string>> {
    const realPath = await this.getRealPath(fullPath);
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

  async existsDirectory(folder: string): Promise<boolean> {
    const realPath = await this.getRealPath(folder);

    if (!fs.existsSync(realPath)) return false;
    if (!fs.statSync(realPath).isDirectory()) {
      throw BasicError.badQuery(
        this.fullName,
        "existsDirectory/not-a-directory",
        folder
      );
    }
    return true;
  }

  async existsFile(fullPath: string): Promise<boolean> {
    const realPath = await this.getRealPath(fullPath);

    if (!fs.existsSync(realPath)) return false;
    if (fs.statSync(realPath).isDirectory()) {
      throw BasicError.badQuery(
        this.fullName,
        "existsFile/not-a-file",
        fullPath
      );
    }
    return true;
  }

  async createDirectory(fullPath: string): Promise<boolean> {
    const realPath = await this.getRealPath(fullPath);

    if (fs.existsSync(realPath)) {
      throw BasicError.badQuery(
        this.fullName,
        "createDirectory/already-exists",
        fullPath
      );
    }
    if (fs.statSync(realPath).isDirectory()) {
      throw BasicError.badQuery(
        this.fullName,
        "existsFile/not-a-file",
        fullPath
      );
    }
    fs.mkdirSync(realPath);
    return true;
  }

  async createTempDirectory(): Promise<string> {
    const realPath = await this.getRealPath(".");

    if (!fs.existsSync(realPath)) {
      fs.mkdirSync(realPath);
    }
    const realTmp = fs.mkdtempSync(realPath + path.sep);
    const relative = await this.getRelativePath(realTmp);

    return relative + path.sep;
  }

  async stat(fullPath: string): Promise<IStorageFileSystemDriverStat> {
    const realPath = await this.getRealPath(fullPath);

    if (!fs.existsSync(realPath)) {
      throw BasicError.notFound(this.fullName, "stat", fullPath);
    }
    const stat = fs.statSync(realPath);
    return {
      path: fullPath,
      provider: this.id,
      body: stat,
    };
  }

  async writeFile(fullPath: string, body: Buffer): Promise<boolean> {
    const realPath = await this.getRealPath(fullPath);

    fs.writeFileSync(realPath, body);
    return true;
  }

  async writeTextFile(fullPath: string, body: string): Promise<boolean> {
    const realPath = await this.getRealPath(fullPath);

    fs.writeFileSync(realPath, body, { encoding: "utf-8" });
    return true;
  }

  async deleteFile(fullPath: string): Promise<boolean> {
    const realPath = await this.getRealPath(fullPath);

    if (!fs.existsSync(realPath)) {
      return false;
    }
    fs.unlinkSync(realPath);
    return true;
  }

  async deleteDirectory(fullPath: string): Promise<boolean> {
    const realPath = await this.getRealPath(fullPath);

    if (!fs.existsSync(realPath)) {
      return false;
    }
    fs.rmdirSync(realPath);
    return true;
  }

  async getRealPath(relPath: string): Promise<string> {
    const folderProperty = "folder";
    const folderValue = this.properties[folderProperty];

    if (folderValue === undefined)
      throw BasicError.notFound(
        this.fullName,
        "computeRealPath/" + folderProperty,
        folderProperty
      );

    if (typeof folderValue !== "string") {
      throw BasicError.badQuery(
        this.fullName,
        "computeRealPath/" + folderProperty,
        String(folderValue)
      );
    }
    return path.resolve(folderValue, relPath);
  }

  async getRelativePath(realPath: string): Promise<string> {
    const rootRealPath = await this.getRealPath(".");

    return realPath.replace(rootRealPath + path.sep, "").trim();
  }
}
