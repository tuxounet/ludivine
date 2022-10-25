import { ObservableElement } from "../bases/ObservableElement";
import { IKernel } from "../kernel/IKernel";
import { IKernelElement } from "../kernel/IKernelElement";
import { IMessageEvent } from "./IMessageEvent";

export class Topic extends ObservableElement {
  constructor(
    readonly name: string,
    readonly kernel: IKernel,
    readonly parent: IKernelElement
  ) {
    super(name, kernel, parent);
  }

  async publish(message: Record<string, string>): Promise<void> {
    this.log.debug("publishing", message);
    const ev: IMessageEvent = {
      sender: this.fullName,
      recipient: this.name,
      date: new Date().toISOString(),
      body: message,
    };
    await this.notifyAll(ev);
    this.log.debug("published", message);
  }
}
