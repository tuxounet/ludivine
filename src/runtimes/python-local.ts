import { bases, kernel, errors, compute } from "@ludivine/shared";

export class ComputeRuntimePython extends bases.ComputeRuntimeElement {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("python-local", "python3", kernel, parent);
    this.commandsDependencies = [
      {
        name: "python3",
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
    return await this.executeSystemCommand(`python3 -m pip install ${name}`);
  }
}
