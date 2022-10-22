import { KernelElement } from "../bases/KernelElement";
import { ObservableElement } from "../bases/ObservableElement";
import { IMessageEvent } from "./IMessageEvent";

export class Topic extends ObservableElement {
  constructor(readonly name: string, parent: KernelElement) {
    super(name, parent);
  }

  async publish(message: Record<string, string>) {
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
