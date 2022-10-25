import { IKernelElement } from "../kernel/IKernelElement";

export interface IMessagingBroker extends IKernelElement {
  subscribeTopic: (topic: string, subscriber: IKernelElement) => Promise<void>;
  unsubscribeTopic: (topic: string, subscriber: string) => Promise<void>;
  subscribeQueue: (queue: string, subscriber: IKernelElement) => Promise<void>;
  unsubscribeQueue: (queue: string, subscriber: string) => Promise<void>;
  publish: (topic: string, message: Record<string, string>) => Promise<void>;
  enqueue: (queue: string, message: Record<string, string>) => Promise<void>;
}
