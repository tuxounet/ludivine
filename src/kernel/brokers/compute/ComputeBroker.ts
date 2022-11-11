import { ComputeRuntimeBash } from "./runtimes/bash-local";
import { ComputeRuntimeJavascript } from "./runtimes/javascript-local";
import { ComputeRuntimePython } from "./runtimes/python-local";
import { ComputeRuntimeTypescript } from "./runtimes/typescript-local";
import { bases, compute, errors, storage, kernel } from "@ludivine/runtime";

export class ComputeBroker
  extends bases.KernelElement
  implements compute.IComputeBroker
{
  constructor(readonly kernel: kernel.IKernel) {
    super("compute", kernel);
    this.runtimes = [
      new ComputeRuntimeBash(this),
      new ComputeRuntimePython(this),
      new ComputeRuntimeJavascript(this),
      new ComputeRuntimeTypescript(this),
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

  async executeEval(
    runtime: string,
    strToEval: string,
    runVolume: storage.IStorageVolume
  ): Promise<compute.IComputeExecuteResult> {
    const localRuntime = this.runtimes.find((item) => item.name === runtime);
    if (localRuntime == null) {
      throw errors.BasicError.notFound(
        this.fullName,
        "executeEval/runtime",
        runtime
      );
    }
    await localRuntime.provision();
    const result = await localRuntime.executeEval(strToEval, runVolume);
    await localRuntime.unprovision();
    return result;
  }

  async executeSource(
    runtime: string,
    sourceVolume: storage.IStorageVolume,
    dependencies: compute.IComputeDependency[],
    entryPoint: string,
    args?: string[]
  ): Promise<compute.IComputeExecuteResult> {
    const localRuntime = this.runtimes.find((item) => item.name === runtime);
    if (localRuntime == null) {
      throw errors.BasicError.notFound(
        this.fullName,
        "executeSource/runtime",
        runtime
      );
    }
    return await localRuntime.executeSource(
      sourceVolume,
      dependencies,
      entryPoint,
      args
    );
  }
}
