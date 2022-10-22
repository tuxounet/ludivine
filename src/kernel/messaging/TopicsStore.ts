import { KernelElement } from "../bases/KernelElement";
import { Topic } from "./Topic";

export class TopicsStore extends KernelElement {
  constructor(readonly parent: KernelElement) {
    super("topics-store", parent);
    this.topics = new Map();
  }

  topics: Map<string, Topic>;

  async registerTopic(name: string): Promise<void> {
    this.log.debug("registering", name);
    const topic = new Topic(name, this);
    this.topics.set(name, topic);
    this.log.debug("registed", name);
  }

  async unregisterTopic(name: string): Promise<void> {
    this.log.debug("unregistering", name);
    this.topics.delete(name);
    this.log.debug("unregistered", name);
  }
}
