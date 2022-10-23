import { ObservableElement } from "../../shared/bases/ObservableElement";
import { BasicError } from "../../shared/errors/BasicError";
import { IKernel } from "../../shared/kernel/IKernel";
import { IKernelElement } from "../../shared/kernel/IKernelElement";

export class Queue<T = Record<string, unknown>> extends ObservableElement {
  q: T[];
  constructor(
    name: string,
    readonly kernel: IKernel,
    readonly parent: IKernelElement
  ) {
    super(name, kernel, parent);
    this.q = [];
  }

  enqueue(item: T): void {
    this.q.push(item);
  }

  canDequeue(): boolean {
    return this.q.length > 0;
  }

  dequeue(): T {
    const msg = this.q.shift();
    if (msg === undefined)
      throw BasicError.badQuery(this.fullName, "queue", "dequeue");
    return msg;
  }
}
