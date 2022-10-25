import { bases, kernel, messaging } from "@ludivine/shared";

export class TopicsStore extends bases.KernelElement {
  constructor(
    readonly kernel: kernel.IKernel,
    readonly parent: kernel.IKernelElement
  ) {
    super("topics-store", kernel, parent);
    this.topics = new Map();
  }

  topics: Map<string, messaging.Topic>;

  async registerTopic(name: string): Promise<void> {
    this.log.debug("registering", name);
    const topic = new messaging.Topic(name, this.kernel, this);
    this.topics.set(name, topic);
    this.log.debug("registed", name);
  }

  async unregisterTopic(name: string): Promise<void> {
    this.log.debug("unregistering", name);
    this.topics.delete(name);
    this.log.debug("unregistered", name);
  }
}
