import { KernelElement } from "../../shared/bases/KernelElement";
import { IKernel } from "../../shared/kernel/IKernel";
import { Queue } from "./Queue";

export class QueuesStore extends KernelElement {
  constructor(readonly kernel: IKernel, readonly parent: KernelElement) {
    super("queues-store", kernel, parent);
    this.queues = new Map();
  }

  queues: Map<string, Queue>;

  async registerQueue(name: string): Promise<void> {
    this.log.debug("registering", name);
    const queue = new Queue(name, this.kernel, this);
    this.queues.set(name, queue);
    this.log.debug("registed", name);
  }

  async unregisterQueue(name: string): Promise<void> {
    this.log.debug("unregistering", name);
    this.queues.delete(name);
    this.log.debug("unregistered", name);
  }
}
