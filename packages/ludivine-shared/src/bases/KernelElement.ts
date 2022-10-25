import { IKernelElement } from "../kernel/IKernelElement";
import { Logger } from "../logging/Logger";

import { IKernel } from "../kernel/IKernel";
import { Observer } from "../messaging/Observer";

export abstract class KernelElement extends Observer implements IKernelElement {
  constructor(
    readonly name: string,
    readonly kernel: IKernel,
    readonly parent?: IKernelElement,
    readonly substriptions?: string[]
  ) {
    super();
    this.log = new Logger(this, (line) => {
      this.kernel.logging.output(line);
    });
  }

  async initialize(): Promise<void> {
    this.log.debug("initialzed");
  }

  async shutdown(): Promise<void> {
    this.log.debug("stopped");
  }

  protected log: Logger;
  get fullName(): string {
    if (this.parent != null) {
      return this.parent.fullName + "." + this.name;
    } else {
      return this.kernel.fullName + "." + this.name;
    }
  }
}
