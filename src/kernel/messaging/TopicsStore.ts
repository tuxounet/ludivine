import { KernelElement } from "../../shared/bases/KernelElement";
import { IKernel } from "../../shared/kernel/IKernel";
import { IKernelElement } from "../../shared/kernel/IKernelElement";
import { Topic } from "./Topic";

export class TopicsStore extends KernelElement {
  constructor(readonly kernel: IKernel, readonly parent: IKernelElement) {
    super("topics-store", kernel, parent);
    this.topics = new Map();
  }

  topics: Map<string, Topic>;

  async registerTopic(name: string): Promise<void> {
    this.log.debug("registering", name);
    const topic = new Topic(name, this.kernel, this);
    this.topics.set(name, topic);
    this.log.debug("registed", name);
  }

  async unregisterTopic(name: string): Promise<void> {
    this.log.debug("unregistering", name);
    this.topics.delete(name);
    this.log.debug("unregistered", name);
  }
}
