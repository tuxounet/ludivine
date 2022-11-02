import { bases, kernel, messaging, errors, logging } from "@ludivine/runtime";
import { QueuesStore } from "./QueuesStore";
import { TopicsStore } from "./TopicsStore";

export class MessagingBroker
  extends bases.KernelElement
  implements messaging.IMessagingBroker
{
  constructor(kernel: kernel.IKernel) {
    super("topic-broker", kernel);
    this.topicsStore = new TopicsStore(this.kernel, this);
    this.queuesStore = new QueuesStore(this.kernel, this);
  }

  topicsStore: TopicsStore;
  queuesStore: QueuesStore;

  @logging.logMethod()
  async subscribeTopic(
    topic: string,
    subscriber: kernel.IKernelElement
  ): Promise<void> {
    if (!this.topicsStore.topics.has(topic)) {
      await this.topicsStore.registerTopic(topic);
    }
    const currentTopic = this.topicsStore.topics.get(topic);
    if (currentTopic == null) {
      throw errors.BasicError.notFound(this.fullName, "topic", topic);
    }

    currentTopic.register(subscriber);
  }

  @logging.logMethod()
  async unsubscribeTopic(topic: string, subscriber: string): Promise<void> {
    const currentTopic = this.topicsStore.topics.get(topic);
    if (currentTopic != null) {
      currentTopic.unregister(subscriber);
    }
  }

  @logging.logMethod()
  async publish(topic: string, message: Record<string, string>): Promise<void> {
    if (!this.topicsStore.topics.has(topic)) {
      await this.topicsStore.registerTopic(topic);
    }
    const currentTopic = this.topicsStore.topics.get(topic);
    if (currentTopic == null) {
      throw errors.BasicError.notFound(this.fullName, "topic", topic);
    }
    await currentTopic.notify(message);
  }
}
