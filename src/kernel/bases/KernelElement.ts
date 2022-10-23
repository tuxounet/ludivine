import { Logger } from "../logging/Logger";
import { Observer } from "../messaging/Observer";

export interface IKernelElement {
  readonly fullName: string;
  initialize: () => Promise<void>;
  shutdown: () => Promise<void>;
}

export abstract class KernelElement extends Observer implements IKernelElement {
  constructor(
    readonly name: string,
    readonly parent?: KernelElement,
    readonly substriptions?: string[]
  ) {
    super();
    this.log = new Logger(this);
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
    }
    return this.name;
  }
}
