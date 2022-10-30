import { bases, kernel } from "@ludivine/runtime";

export class ComputeRuntimeBash extends bases.ComputeRuntimeElement {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("bash-local", "bash ", "-c", kernel, parent);
    this.commandsDependencies = [
      {
        name: "bash",
      },
    ];
  }
}
