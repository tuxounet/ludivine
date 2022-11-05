import {
  bases,
  channels,
  kernel,
  logging,
  messaging,
  sessions,
} from "@ludivine/runtime";
import events from "events";
export class Session extends bases.KernelElement implements sessions.ISession {
  constructor(
    readonly id: string,
    kernel: kernel.IKernel,
    parent?: kernel.IKernelElement
  ) {
    super(id, kernel, parent);
    this.sequence = 0;

    this.emitter = new events.EventEmitter();
  }

  emitter: events.EventEmitter;
  sequence: number;

  @logging.logMethod()
  async initialize(): Promise<void> {
    await this.kernel.endpoints.openEndpoint(this, "cli");
    await this.kernel.messaging.subscribeTopic("/sessions/" + this.id, this);
  }

  @logging.logMethod()
  async shutdown(): Promise<void> {
    await this.kernel.messaging.unsubscribeTopic(
      "/sessions/" + this.id,
      this.fullName
    );

    await this.kernel.endpoints.closeEndpoint(this.id);
  }

  @logging.logMethod()
  protected async waitForReply(
    sequence: string,
    timeout: number = 30000
  ): Promise<messaging.IMessageEvent> {
    return await new Promise<messaging.IMessageEvent>((resolve, reject) => {
      const solver = (message: messaging.IMessageEvent): void => {
        clearTimeout(timoutTmr);
        resolve(message);
      };
      const timoutTmr = setTimeout(() => {
        clearTimeout(timoutTmr);
        this.emitter.off(sequence, solver);

        reject(new Error("reply timeout for sequence " + sequence));
      }, timeout);
      this.emitter.once(sequence, solver);
    });
  }

  @logging.logMethod()
  async onMessage(messageEvent: messaging.IMessageEvent): Promise<void> {
    const sequence = messageEvent.body.sequence;

    if (sequence != null && typeof sequence === "string") {
      this.emitter.emit(sequence, messageEvent);
    }
  }

  @logging.logMethod()
  async output(out: channels.IOutputMessage): Promise<void> {
    const endpoint = await this.kernel.endpoints.get(this.id);
    await endpoint.emitOutput(out);
  }

  @logging.logMethod()
  async input(
    query: channels.IInputQuery
  ): Promise<channels.IInputMessage<string>> {
    this.sequence++;

    const sequence = "I" + String(this.sequence);
    const endpoint = await this.kernel.endpoints.get(this.id);

    await endpoint.emitEvent({
      type: "input",
      body: JSON.stringify({
        session: this.id,
        sequence,
        query,
      }),
    });

    const message = await this.waitForReply(sequence);

    if (message === undefined) {
      throw new Error("no messsage in reply for sequence " + sequence);
    }

    const line = String(message.body.value);

    const result: channels.IInputMessage<string> = {
      sender: message.sender,
      type: "line",
      value: line,
    };

    return result;
  }

  @logging.logMethod()
  async terminate(): Promise<boolean> {
    this.log.warn("terminate query ");
    return true;
  }
}
