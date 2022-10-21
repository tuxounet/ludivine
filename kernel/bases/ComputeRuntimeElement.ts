import {
  IComputeCommandDependency,
  IComputeDependency,
  IComputeExecuteResult,
  IComputeProjectCode,
  IComputeRuntime,
  IComputeSourceCode,
} from "../compute/types/IComputeRuntime";
import { KernelElement } from "./KernelElement";
import commandExists from "command-exists";
import { BasicError } from "../errors/BasicError";
import childProc from "child_process";
import fs from "fs";
import path from "path";
import { KERNEL_TMP_PREFIX } from "../constants";

export abstract class ComputeRuntimeElement
  extends KernelElement
  implements IComputeRuntime
{
  constructor(name: string, parent: KernelElement, subscriptions?: string[]) {
    super(name, parent, subscriptions);
    this.commandsDependencies = [];
    this.runDirectory = KERNEL_TMP_PREFIX;
  }
  commandsDependencies: IComputeCommandDependency[];
  protected runDirectory: string;
  async ensureCommandDependencies(): Promise<void> {
    let failed: IComputeDependency[] = [];
    for (const dep of this.commandsDependencies) {
      try {
        await commandExists(dep.name);
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

  async provision(): Promise<boolean> {
    return true;
  }
  async unprovision(): Promise<boolean> {
    return false;
  }
  abstract ensureDependencies(
    runFolder: string,
    deps: IComputeDependency[]
  ): Promise<void>;

  abstract executeSource(
    source: IComputeSourceCode
  ): Promise<IComputeExecuteResult>;
  abstract executeProject(
    project: IComputeProjectCode
  ): Promise<IComputeExecuteResult>;

  protected async createNewRunDir() {
    if (!fs.existsSync(KERNEL_TMP_PREFIX)) {
      fs.mkdirSync(KERNEL_TMP_PREFIX);
    }
    this.runDirectory = fs.mkdtempSync(KERNEL_TMP_PREFIX);
  }

  protected async cleanupRunDir() {
    const files = await fs.promises.readdir(this.runDirectory);
    await Promise.all(
      files.map((item) =>
        fs.promises.unlink(path.resolve(this.runDirectory, item))
      )
    );
    await fs.promises.rmdir(this.runDirectory);
  }

  protected async extractRunLog() {
    const logFile = path.resolve(this.runDirectory, "output.log");
    const logs = await fs.promises.readFile(logFile, { encoding: "utf-8" });
    return logs;
  }

  protected async executeSystemCommand(cmd: string): Promise<number> {
    return await new Promise<number>((resolve) => {
      try {
        childProc.execSync(`${cmd}>> "${this.runDirectory + path.sep}output.log"`, {
          cwd: this.runDirectory,
          shell: "bash",
        });
        resolve(0);
      } catch (error) {
        fs.writeFileSync("output.log", "Fatal: " + error, {
          encoding: "utf-8",
        });
        resolve(1);
      }
    });
  }
}
