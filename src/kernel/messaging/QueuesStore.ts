import { bases, kernel, messaging } from "@ludivine/shared";

export class QueuesStore extends bases.KernelElement {
  constructor(
    readonly kernel: kernel.IKernel,
    readonly parent: kernel.IKernelElement
  ) {
    super("queues-store", kernel, parent);
    this.queues = new Map();
  }

  queues: Map<string, messaging.Queue>;

  async registerQueue(name: string): Promise<void> {
    this.log.debug("registering", name);
    const queue = new messaging.Queue(name, this.kernel, this);
    this.queues.set(name, queue);
    this.log.debug("registed", name);
  }

  async unregisterQueue(name: string): Promise<void> {
    this.log.debug("unregistering", name);
    this.queues.delete(name);
    this.log.debug("unregistered", name);
  }
}
