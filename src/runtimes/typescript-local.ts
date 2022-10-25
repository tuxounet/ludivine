import { bases, kernel, errors, compute } from "@ludivine/shared";

export class ComputeRuntimeTypescript extends bases.ComputeRuntimeElement {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("typescript-local", "ts-node", kernel, parent);
    this.commandsDependencies = [
      {
        name: "ts-node",
      },
    ];
  }

  async ensureDependencies(deps: compute.IComputeDependency[]): Promise<void> {
    const failed: compute.IComputeDependency[] = [];
    for (const dep of deps) {
      try {
        await this.installPackage(dep.name);
      } catch {
        failed.push(dep);
      }
    }
    if (failed.length > 0) {
      throw errors.BasicError.notFound(
        this.name,
        "dependencies failed",
        failed.map((item) => item.name).join(",")
      );
    }
  }

  private async installPackage(name: string): Promise<number> {
    return await this.executeSystemCommand(
      `npm install --prefer-offline ${name}`
    );
  }
}
