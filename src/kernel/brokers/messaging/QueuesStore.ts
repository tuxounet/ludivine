import { bases, kernel, logging, messaging } from "@ludivine/runtime";
export class QueuesStore extends bases.KernelElement {
  constructor(
    readonly kernel: kernel.IKernel,
    readonly parent: kernel.IKernelElement
  ) {
    super("queues", kernel, parent);
    this.queues = new Map();
  }

  queues: Map<string, messaging.Queue>;

  @logging.logMethod()
  async createQueue(name: string): Promise<void> {
    const queue = new messaging.Queue(name, this.kernel, this);
    this.queues.set(name, queue);
  }

  @logging.logMethod()
  async deleteQueue(name: string): Promise<void> {
    this.queues.delete(name);
  }
}
