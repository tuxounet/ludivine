import { KernelElement } from "../bases/KernelElement";
import { ObservableElement } from "../bases/ObservableElement";

export class Queue<T = Record<string, unknown>> extends ObservableElement {
  q: T[];
  constructor(name: string, parent: KernelElement) {
    super(name, parent);
    this.q = [];
  }

  async enqueue(item: T) {
    this.q.push(item);
  }

  async dequeue() {
    return this.q.shift();
  }
}
