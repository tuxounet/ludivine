import { kernel, logging, messaging } from "@tuxounet/ludivine-shared";

export abstract class KernelElement
  extends messaging.Observer
  implements kernel.IKernelElement
{
  constructor(
    readonly name: string,
    readonly kernel: kernel.IKernel,
    readonly parent?: kernel.IKernelElement,
    readonly substriptions?: string[]
  ) {
    super();
    this.log = new logging.Logger(this, (line: logging.ILogLine) => {
      this.kernel.logging.output(line);
    });
  }

  async initialize(): Promise<void> {
    this.log.debug("initialzed");
  }

  async shutdown(): Promise<void> {
    this.log.debug("stopped");
  }

  protected log: logging.Logger;
  get fullName(): string {
    if (this.parent != null) {
      return this.parent.fullName + "." + this.name;
    } else {
      return this.kernel.fullName + "." + this.name;
    }
  }
}
