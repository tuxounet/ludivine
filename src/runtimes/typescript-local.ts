import { bases, kernel, storage } from "@ludivine/runtime";

export class ComputeRuntimeTypescript extends bases.ComputeRuntimeElement {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("typescript-local", "ts-node", "-p -e", kernel, parent);
    this.commandsDependencies = [
      {
        name: "ts-node",
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
