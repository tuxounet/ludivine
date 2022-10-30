import { bases, kernel, modules } from "@ludivine/runtime";

export class ModulesBroker
  extends bases.KernelElement
  implements modules.IModulesBroker
{
  constructor(kernel: kernel.IKernel) {
    super("modules-broker", kernel);
  }
}
