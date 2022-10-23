import { KernelElement } from "../../shared/bases/KernelElement";
import { Queue } from "./Queue";

export class QueuesStore extends KernelElement {
  constructor(readonly parent: KernelElement) {
    super("queues-store", parent);
    this.queues = new Map();
  }

  queues: Map<string, Queue>;

  async registerQueue(name: string): Promise<void> {
    this.log.debug("registering", name);
    const queue = new Queue(name, this);
    this.queues.set(name, queue);
    this.log.debug("registed", name);
  }

  async unregisterQueue(name: string): Promise<void> {
    this.log.debug("unregistering", name);
    this.queues.delete(name);
    this.log.debug("unregistered", name);
  }
}
