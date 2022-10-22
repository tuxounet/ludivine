import { ComputeRuntimeBash } from "../../runtimes/bash-local";
import { ComputeRuntimeJavascript } from "../../runtimes/javascript-local";
import { ComputeRuntimePython } from "../../runtimes/python-local";
import { ComputeRuntimeTypescript } from "../../runtimes/typescript-local";
import { KernelElement } from "../bases/KernelElement";
import { BasicError } from "../errors/BasicError";
import { Kernel } from "../kernel";
import {
  IComputeProjectCode,
  IComputeRuntime,
  IComputeSourceCode,
} from "./types/IComputeRuntime";

export class ComputeBroker extends KernelElement {
  constructor(readonly kernel: Kernel) {
    super("compute-broker", kernel);
    this.runtimes = [
      new ComputeRuntimeBash(kernel, this),
      new ComputeRuntimePython(kernel, this),
      new ComputeRuntimeJavascript(kernel, this),
      new ComputeRuntimeTypescript(kernel, this),
    ];
  }

  runtimes: IComputeRuntime[];

  async initialize() {
    await Promise.all(
      this.runtimes.map(async (item) => await item.provision())
    );
  }

  async shutdown() {
    await Promise.all(
      this.runtimes.reverse().map(async (item) => await item.unprovision())
    );
  }

  async executeSource(runtime: string, source: IComputeSourceCode) {
    const localRuntime = this.runtimes.find((item) => item.name === runtime);
    if (localRuntime == null) {
      throw BasicError.notFound(this.fullName, "compute runtime", runtime);
    }
    return await localRuntime.executeSource(source);
  }

  async executeProject(runtime: string, project: IComputeProjectCode) {
    const localRuntime = this.runtimes.find((item) => item.name === runtime);
    if (localRuntime == null) {
      throw BasicError.notFound(this.fullName, "compute runtime", runtime);
    }
    return await localRuntime.executeProject(project);
  }
}
