import { bases, kernel, logging, messaging } from "@ludivine/runtime";
export class TopicsStore extends bases.KernelElement {
  constructor(
    readonly kernel: kernel.IKernel,
    readonly parent: kernel.IKernelElement
  ) {
    super("topics-store", kernel, parent);
    this.topics = new Map();
  }

  topics: Map<string, messaging.Topic>;
  @logging.logMethod()
  async registerTopic(name: string): Promise<void> {
    const topic = new messaging.Topic(name, this.kernel, this);
    this.topics.set(name, topic);
  }

  @logging.logMethod()
  async unregisterTopic(name: string): Promise<void> {
    this.topics.delete(name);
  }
}
