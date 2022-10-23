import { IMessageEvent } from "../../kernel/messaging/IMessageEvent";
import { KernelElement } from "./KernelElement";

export interface IObservableElement {
  register: (observer: KernelElement) => void;
  unregister: (observerName: string) => void;
}

export abstract class ObservableElement
  extends KernelElement
  implements IObservableElement
{
  constructor(
    readonly name: string,
    readonly parent: KernelElement,
    readonly subscriptions?: string[]
  ) {
    super(name, parent, subscriptions);
    this.observers = new Map();
  }

  observers: Map<string, KernelElement>;

  register(observer: KernelElement): void {
    this.observers.set(observer.fullName, observer);
  }

  unregister(observerName: string): void {
    this.observers.delete(observerName);
  }

  protected async notifyAll(message: IMessageEvent): Promise<void> {
    const proms = [];
    for (const observer of this.observers.values()) {
      if (observer.onMessage != null) {
        proms.push(observer.onMessage(message));
      }
    }
    await Promise.all(proms);
  }
}
