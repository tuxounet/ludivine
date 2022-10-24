import { ComputeRuntimeBash } from "../../runtimes/bash-local";
import { ComputeRuntimeJavascript } from "../../runtimes/javascript-local";
import { ComputeRuntimePython } from "../../runtimes/python-local";
import { ComputeRuntimeTypescript } from "../../runtimes/typescript-local";

import {
  IComputeExecuteResult,
  IComputeProjectCode,
  IComputeRuntime,
  IComputeSourceCode,
} from "../../shared/compute/IComputeRuntime";

import { IComputeBroker } from "../../shared/compute/IComputeBroker";
import { KernelElement } from "../../shared/bases/KernelElement";
import { BasicError } from "../../shared/errors/BasicError";
import { IKernel } from "../../shared/kernel/IKernel";

export class ComputeBroker extends KernelElement implements IComputeBroker {
  constructor(readonly kernel: IKernel) {
    super("compute-broker", kernel);
    this.runtimes = [
      new ComputeRuntimeBash(kernel, this),
      new ComputeRuntimePython(kernel, this),
      new ComputeRuntimeJavascript(kernel, this),
      new ComputeRuntimeTypescript(kernel, this),
    ];
  }

  runtimes: IComputeRuntime[];

  async initialize(): Promise<void> {
    await Promise.all(
      this.runtimes.map(async (item) => await item.provision())
    );
  }

  async shutdown(): Promise<void> {
    await Promise.all(
      this.runtimes.reverse().map(async (item) => await item.unprovision())
    );
  }

  async executeSource(
    runtime: string,
    source: IComputeSourceCode
  ): Promise<IComputeExecuteResult> {
    const localRuntime = this.runtimes.find((item) => item.name === runtime);
    if (localRuntime == null) {
      throw BasicError.notFound(this.fullName, "compute runtime", runtime);
    }
    return await localRuntime.executeSource(source);
  }

  async executeProject(
    runtime: string,
    project: IComputeProjectCode
  ): Promise<IComputeExecuteResult> {
    const localRuntime = this.runtimes.find((item) => item.name === runtime);
    if (localRuntime == null) {
      throw BasicError.notFound(this.fullName, "compute runtime", runtime);
    }
    return await localRuntime.executeProject(project);
  }
}
