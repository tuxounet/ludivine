import { ComputeRuntimeBash } from "../../runtimes/bash-local";
import { ComputeRuntimeJavascript } from "../../runtimes/javascript-local";
import { ComputeRuntimePython } from "../../runtimes/python-local";
import { ComputeRuntimeTypescript } from "../../runtimes/typescript-local";
import { bases, kernel, compute, errors, storage } from "@ludivine/runtime";
export class ComputeBroker
  extends bases.KernelElement
  implements compute.IComputeBroker
{
  constructor(readonly kernel: kernel.IKernel) {
    super("compute-broker", kernel);
    this.runtimes = [
      new ComputeRuntimeBash(kernel, this),
      new ComputeRuntimePython(kernel, this),
      new ComputeRuntimeJavascript(kernel, this),
      new ComputeRuntimeTypescript(kernel, this),
    ];
  }

  runtimes: compute.IComputeRuntime[];

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
    source: compute.IComputeSourceCode
  ): Promise<compute.IComputeExecuteResult> {
    const localRuntime = this.runtimes.find((item) => item.name === runtime);
    if (localRuntime == null) {
      throw errors.BasicError.notFound(
        this.fullName,
        "compute runtime",
        runtime
      );
    }
    return await localRuntime.executeSource(source);
  }

  async executeProject(
    runtime: string,
    project: compute.IComputeProjectCode
  ): Promise<compute.IComputeExecuteResult> {
    const localRuntime = this.runtimes.find((item) => item.name === runtime);
    if (localRuntime == null) {
      throw errors.BasicError.notFound(
        this.fullName,
        "compute runtime",
        runtime
      );
    }
    return await localRuntime.executeProject(project);
  }

  async executeEval(
    runtime: string,
    strToEval: string,
    runVolume: storage.IStorageVolume
  ): Promise<compute.IComputeExecuteResult> {
    const localRuntime = this.runtimes.find((item) => item.name === runtime);
    if (localRuntime == null) {
      throw errors.BasicError.notFound(
        this.fullName,
        "compute runtime",
        runtime
      );
    }

    return await localRuntime.executeEval(strToEval, runVolume);
  }
}
