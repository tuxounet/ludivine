import { KernelElement } from "../../shared/bases/KernelElement";
import { ObservableElement } from "../../shared/bases/ObservableElement";
import { BasicError } from "../../shared/errors/BasicError";

export class Queue<T = Record<string, unknown>> extends ObservableElement {
  q: T[];
  constructor(name: string, parent: KernelElement) {
    super(name, parent);
    this.q = [];
  }

  async enqueue(item: T): Promise<void> {
    this.q.push(item);
  }

  async dequeue(): Promise<T> {
    const msg = this.q.shift();
    if (msg === undefined)
      throw BasicError.badQuery(this.fullName, "queue", "dequeue");
    return msg;
  }
}
