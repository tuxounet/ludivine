import { KernelElement } from "../../shared/bases/KernelElement";
import { BasicError } from "../../shared/errors/BasicError";
import { IKernel } from "../../shared/kernel/IKernel";
import { QueuesStore } from "./QueuesStore";
import { TopicsStore } from "./TopicsStore";

export class MessagingBroker extends KernelElement {
  constructor(kernel: IKernel) {
    super("topic-broker", kernel);
    this.topicsStore = new TopicsStore(this.kernel, this);
    this.queuesStore = new QueuesStore(this.kernel, this);
  }

  topicsStore: TopicsStore;
  queuesStore: QueuesStore;

  async subscribeTopic(
    topic: string,
    subscriber: KernelElement
  ): Promise<void> {
    this.log.debug("subscribe", topic, "by", subscriber.fullName);
    if (!this.topicsStore.topics.has(topic)) {
      await this.topicsStore.registerTopic(topic);
    }
    const currentTopic = this.topicsStore.topics.get(topic);
    if (currentTopic == null) {
      throw BasicError.notFound(this.fullName, "topic", topic);
    }

    currentTopic.register(subscriber);
    this.log.debug("subscribed", topic, "by", subscriber.fullName);
  }

  async unsubscribeTopic(topic: string, subscriber: string): Promise<void> {
    this.log.debug("unsubscribe", topic, "by", subscriber);

    const currentTopic = this.topicsStore.topics.get(topic);
    if (currentTopic != null) {
      currentTopic.unregister(subscriber);
    }

    this.log.debug("unsubscribed", topic, "by", subscriber);
  }

  async subscribeQueue(
    queue: string,
    subscriber: KernelElement
  ): Promise<void> {
    this.log.debug("subscribe", queue, "by", subscriber.fullName);
    if (!this.queuesStore.queues.has(queue)) {
      await this.queuesStore.registerQueue(queue);
    }
    const current = this.queuesStore.queues.get(queue);
    if (current == null) {
      throw BasicError.notFound(this.fullName, "queue", queue);
    }

    current.register(subscriber);
    this.log.debug("subscribed", queue, "by", subscriber.fullName);
  }

  async unsubscribeQueue(queue: string, subscriber: string): Promise<void> {
    this.log.debug("unsubscribe", queue, "by", subscriber);

    const current = this.topicsStore.topics.get(queue);
    if (current != null) {
      current.unregister(subscriber);
    }

    this.log.debug("unsubscribed", queue, "by", subscriber);
  }

  async publish(topic: string, message: Record<string, string>): Promise<void> {
    this.log.debug("publish", topic, "with", message);
    if (!this.topicsStore.topics.has(topic)) {
      await this.topicsStore.registerTopic(topic);
    }
    const currentTopic = this.topicsStore.topics.get(topic);
    if (currentTopic == null) {
      throw BasicError.notFound(this.fullName, "topic", topic);
    }
    await currentTopic.publish(message);
    this.log.debug("published", topic, "with", message);
  }

  async enqueue(queue: string, message: Record<string, string>): Promise<void> {
    this.log.debug("enqueue", queue, "with", message);
    if (!this.queuesStore.queues.has(queue)) {
      await this.queuesStore.registerQueue(queue);
    }
    const current = this.queuesStore.queues.get(queue);
    if (current == null) {
      throw BasicError.notFound(this.fullName, "topic", queue);
    }
    await current.enqueue(message);
    this.log.debug("enqueued", queue, "with", message);
  }
}
