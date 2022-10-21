import { ComputeRuntimeElement } from "../kernel/bases/ComputeRuntimeElement";
import { KernelElement } from "../kernel/bases/KernelElement";
import { Kernel } from "../kernel/kernel";
import childProc from "child_process";
import {
  IComputeDependency,
  IComputeExecuteResult,
  IComputeProjectCode,
  IComputeSourceCode,
} from "../kernel/compute/types/IComputeRuntime";
import { BasicError } from "../kernel/errors/BasicError";
import fs from "fs";
import path from "path";
import { KERNEL_TMP_PREFIX } from "../kernel/constants";
export class ComputeRuntimeJavascript extends ComputeRuntimeElement {
  constructor(readonly kernel: Kernel, parent: KernelElement) {
    super("javascript-local", parent);
    this.commandsDependencies = [
      {
        name: "node",
      },
    ];
  }
  async ensureDependencies(
    runFolder: string,
    deps: IComputeDependency[]
  ): Promise<void> {
    let failed: IComputeDependency[] = [];
    for (const dep of deps) {
      try {
        await this.installPackage(runFolder, dep.name);
      } catch {
        failed.push(dep);
      }
    }
    if (failed && failed.length > 0) {
      throw BasicError.notFound(
        this.name,
        "dependencies failed",
        failed.map((item) => item.name).join(",")
      );
    }
  }

  private async installPackage(runDirectory: string, name: string) {
    try {
      const output = childProc.execSync(
        `npm install --prefer-offline ${name}`,
        {
          cwd: runDirectory,
          shell: "bash",
        }
      );
      return 0;
    } catch (error) {
      this.log.error("install failed", name, "in", runDirectory, error);
      return 1;
    }
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
      `node ./${fileName} ${source.args ? source.args.join(" ") : " "}`
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
        .map((item) => fs.promises.copyFile(item.source, item.dest))
    );
    await this.ensureDependencies(this.runDirectory, project.dependencies);

    const rc = await this.executeSystemCommand(
      `node ./${project.entryPoint} ${
        project.args ? project.args.join(" ") : " "
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
