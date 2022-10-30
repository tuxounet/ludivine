import { bases, kernel, compute, errors } from "@ludivine/runtime";

export class ComputeRuntimeBash extends bases.ComputeRuntimeElement {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("bash-local", "bash ", "-c", kernel, parent);
    this.commandsDependencies = [
      {
        name: "bash",
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
    return 0;
  }
}
