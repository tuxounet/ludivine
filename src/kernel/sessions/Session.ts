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
    this.waiters = new Map();
    this.emitter = new events.EventEmitter();
    this.replies = new Map();
  }

  waiters: Map<string, sessions.ISessionReplyWaiter>;
  emitter: events.EventEmitter;
  replies: Map<string, messaging.IMessageEvent>;
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
  ): Promise<void> {
    return await new Promise<void>((resolve, reject) => {
      const solver = (): void => {
        clearTimeout(timoutTmr);
        resolve();
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
    console.info("arrival", messageEvent);
    const sequence = messageEvent.body.sequence;

    if (sequence != null && typeof sequence === "string") {
      this.replies.set(sequence, messageEvent);

      console.info("onmessage", sequence, messageEvent);
      this.emitter.emit(sequence);
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

    await this.waitForReply(sequence);
    const message = this.replies.get(sequence);
    console.info("!!!", sequence, this.replies, message);
    if (message === undefined) {
      throw new Error("no messsage in reply for sequence " + sequence);
    }
    const final = Object.assign({}, message);
    const line = String(final.body.value);

    this.replies.delete(sequence);
    console.info("line", line);
    const result: channels.IInputMessage<string> = {
      sender: final.sender,
      type: "line",
      value: line,
    };
    console.info("xoxoxo", sequence, result);
    return result;
  }

  @logging.logMethod()
  async terminate(): Promise<boolean> {
    this.log.warn("terminate query ");
    return true;
  }
}
