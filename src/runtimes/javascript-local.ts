import { bases, kernel, storage } from "@ludivine/runtime";

export class ComputeRuntimeJavascript extends bases.ComputeRuntimeElement {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("javascript-local", "node ", "--eval", kernel, parent);
    this.commandsDependencies = [
      {
        name: "node",
      },
    ];
  }

  protected async installPackage(
    name: string,
    runVolume: storage.IStorageVolume
  ): Promise<number> {
    const result = await this.kernel.compute.executeEval(
      "bash-local",
      `npm install --prefer-offline ${name}`,
      runVolume
    );
    return result.rc;
  }
}
