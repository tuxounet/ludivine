import { bases, kernel, storage } from "@ludivine/runtime";

export class ComputeRuntimePython extends bases.ComputeRuntimeElement {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("python-local", "python3", "-c", kernel, parent);
    this.commandsDependencies = [
      {
        name: "python3",
      },
      {
        name: "pip",
      },
    ];
  }

  protected async installPackage(
    name: string,
    runVolume: storage.IStorageVolume
  ): Promise<number> {
    const result = await this.kernel.compute.executeEval(
      "bash-local",
      `pip install ${name}`,
      runVolume
    );
    return result.rc;
  }
}
