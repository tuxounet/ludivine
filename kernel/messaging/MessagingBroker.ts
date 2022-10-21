import { KernelElement } from "../bases/KernelElement";
import { BasicError } from "../errors/BasicError";
import { QueuesStore } from "./QueuesStore";
import { TopicsStore } from "./TopicsStore";

export class MessagingBroker extends KernelElement {
  constructor(parent: KernelElement) {
    super("topic-broker", parent);
    this.topicsStore = new TopicsStore(this);
    this.queuesStore = new QueuesStore(this);
  }
  topicsStore: TopicsStore;
  queuesStore: QueuesStore;

  async subscribeTopic(topic: string, subscriber: KernelElement) {
    this.log.debug("subscribe", topic, "by", subscriber.fullName);
    if (this.topicsStore.topics.has(topic) == false) {
      await this.topicsStore.registerTopic(topic);
    }
    const currentTopic = this.topicsStore.topics.get(topic);
    if (!currentTopic) {
      throw BasicError.notFound(this.fullName, "topic", topic);
    }

    currentTopic.register(subscriber);
    this.log.debug("subscribed", topic, "by", subscriber.fullName);
  }

  async unsubscribeTopic(topic: string, subscriber: string) {
    this.log.debug("unsubscribe", topic, "by", subscriber);

    const currentTopic = this.topicsStore.topics.get(topic);
    if (currentTopic) {
      currentTopic.unregister(subscriber);
    }

    this.log.debug("unsubscribed", topic, "by", subscriber);
  }

  async subscribeQueue(queue: string, subscriber: KernelElement) {
    this.log.debug("subscribe", queue, "by", subscriber.fullName);
    if (this.queuesStore.queues.has(queue) == false) {
      await this.queuesStore.registerQueue(queue);
    }
    const current = this.queuesStore.queues.get(queue);
    if (!current) {
      throw BasicError.notFound(this.fullName, "queue", queue);
    }

    current.register(subscriber);
    this.log.debug("subscribed", queue, "by", subscriber.fullName);
  }

  async unsubscribeQueue(queue: string, subscriber: string) {
    this.log.debug("unsubscribe", queue, "by", subscriber);

    const current = this.topicsStore.topics.get(queue);
    if (current) {
      current.unregister(subscriber);
    }

    this.log.debug("unsubscribed", queue, "by", subscriber);
  }

  async publish(topic: string, message: Record<string, string>) {
    this.log.debug("publish", topic, "with", message);
    if (this.topicsStore.topics.has(topic) == false) {
      await this.topicsStore.registerTopic(topic);
    }
    const currentTopic = this.topicsStore.topics.get(topic);
    if (!currentTopic) {
      throw BasicError.notFound(this.fullName, "topic", topic);
    }
    await currentTopic.publish(message);
    this.log.debug("published", topic, "with", message);
  }

  async enqueue(queue: string, message: Record<string, string>) {
    this.log.debug("enqueue", queue, "with", message);
    if (this.queuesStore.queues.has(queue) == false) {
      await this.queuesStore.registerQueue(queue);
    }
    const current = this.queuesStore.queues.get(queue);
    if (!current) {
      throw BasicError.notFound(this.fullName, "topic", queue);
    }
    await current.enqueue(message);
    this.log.debug("enqueued", queue, "with", message);
  }
}
