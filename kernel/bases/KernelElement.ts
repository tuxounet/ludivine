import { Logger } from "../logging/Logger";
import { Observer } from "../messaging/Observer";

export interface IKernelElement {
  readonly fullName: string;
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
  protected log: Logger;
  get fullName(): string {
    if (this.parent) {
      return this.parent.fullName + "." + this.name;
    }
    return this.name;
  }
}
