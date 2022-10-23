import { ComputeRuntimeElement } from "../shared/bases/ComputeRuntimeElement";

import { IComputeDependency } from "../shared/compute/IComputeRuntime";
import { BasicError } from "../shared/errors/BasicError";
import { IKernel } from "../shared/kernel/IKernel";
import { IKernelElement } from "../shared/kernel/IKernelElement";

export class ComputeRuntimeJavascript extends ComputeRuntimeElement {
  constructor(readonly kernel: IKernel, parent: IKernelElement) {
    super("javascript-local", "node ", kernel, parent);
    this.commandsDependencies = [
      {
        name: "node",
      },
    ];
  }

  async ensureDependencies(deps: IComputeDependency[]): Promise<void> {
    const failed: IComputeDependency[] = [];
    for (const dep of deps) {
      try {
        await this.installPackage(dep.name);
      } catch {
        failed.push(dep);
      }
    }
    if (failed.length > 0) {
      throw BasicError.notFound(
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
