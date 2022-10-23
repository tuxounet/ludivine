import { IMessageEvent } from "../messaging/IMessageEvent";
import { IKernel } from "../kernel/IKernel";
import { KernelElement } from "./KernelElement";
import { IKernelElement } from "../kernel/IKernelElement";

export interface IObservableElement {
  register: (observer: IKernelElement) => void;
  unregister: (observerName: string) => void;
}

export abstract class ObservableElement
  extends KernelElement
  implements IObservableElement
{
  constructor(
    readonly name: string,
    readonly kernel: IKernel,
    readonly parent: IKernelElement,
    readonly subscriptions?: string[]
  ) {
    super(name, kernel, parent, subscriptions);
    this.observers = new Map();
  }

  observers: Map<string, IKernelElement>;

  register(observer: IKernelElement): void {
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
