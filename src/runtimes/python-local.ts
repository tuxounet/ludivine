import { ComputeRuntimeElement } from "../kernel/bases/ComputeRuntimeElement";
import { KernelElement } from "../kernel/bases/KernelElement";
import { Kernel } from "../kernel/kernel";

import {
  IComputeDependency,
  IComputeExecuteResult,
  IComputeProjectCode,
  IComputeSourceCode,
} from "../kernel/compute/types/IComputeRuntime";
import { BasicError } from "../kernel/errors/BasicError";
import fs from "fs";
import path from "path";

export class ComputeRuntimePython extends ComputeRuntimeElement {
  constructor(readonly kernel: Kernel, parent: KernelElement) {
    super("python-local", parent);
    this.commandsDependencies = [
      {
        name: "python3",
      },
    ];
  }

  async ensureDependencies(
    runFolder: string,
    deps: IComputeDependency[]
  ): Promise<void> {
    const failed: IComputeDependency[] = [];
    for (const dep of deps) {
      try {
        await this.installPackage(dep.name);
      } catch {
        failed.push(dep);
      }
    }
    if (failed.length > 0) {
      throw BasicError.notFound(
        this.name,
        "dependencies failed",
        failed.map((item) => item.name).join(",")
      );
    }
  }

  private async installPackage(name: string): Promise<number> {
    return await this.executeSystemCommand(`pip install  ${name} --user`);
  }

  async executeSource(
    source: IComputeSourceCode
  ): Promise<IComputeExecuteResult> {
    await this.createNewRunDir();
    const fileName = source.name + "." + source.extension;
    const targetFilePath = path.resolve(this.runDirectory, fileName);
    await this.ensureDependencies(this.runDirectory, source.dependencies);
    await fs.promises.writeFile(targetFilePath, source.body, {
      encoding: "utf-8",
    });
    const rc = await this.executeSystemCommand(
      `python3 ./${fileName} ${
        source.args != null ? source.args.join(" ") : " "
      }`
    );

    const logs = await this.extractRunLog();

    await this.cleanupRunDir();

    return {
      rc,
      output: logs,
    };
  }

  async executeProject(
    project: IComputeProjectCode
  ): Promise<IComputeExecuteResult> {
    await this.createNewRunDir();

    const projectFiles = await fs.promises.readdir(project.path);
    await Promise.all(
      projectFiles
        .map((item) => {
          return {
            ext: path.extname(item),
            source: path.resolve(project.path, item),
            dest: path.resolve(this.runDirectory, item),
          };
        })
        .filter((item) => project.extensions.includes(item.ext))
        .map(async (item) => await fs.promises.copyFile(item.source, item.dest))
    );
    await this.ensureDependencies(this.runDirectory, project.dependencies);

    const rc = await this.executeSystemCommand(
      `python3 ./${project.entryPoint} ${
        project.args != null ? project.args.join(" ") : " "
      }`
    );

    const logs = await this.extractRunLog();

    await this.cleanupRunDir();

    return {
      rc,
      output: logs,
    };
  }
}
