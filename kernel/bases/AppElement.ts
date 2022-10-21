import { Kernel } from "../kernel";
import { IMessageEvent } from "../messaging/IMessageEvent";
import { KernelElement } from "./KernelElement";

export interface IAppElement {
  onMessage: (message: IMessageEvent) => Promise<void>;
  execute(): Promise<number>;
}

export abstract class AppElement extends KernelElement implements IAppElement {
  constructor(
    readonly name: string,
    readonly parent: KernelElement,
    readonly kernel: Kernel,
    readonly subscriptions?: string[]
  ) {
    super(name, kernel, subscriptions);
  }

  async execute(): Promise<number> {
    this.log.debug("execution begin");
    await this.onStart();
    const rc = await this.main();
    await this.onStop();
    this.log.debug("execution ended with code", rc);
    return rc;
  }

  protected async waitForShutdown() {
    let loopinterval: NodeJS.Timer;
    await new Promise<void>((resolve) => {
      loopinterval = setInterval(() => {
        if (!this.kernel.started) {
          clearInterval(loopinterval);
          resolve();
        }
      }, 50);
    });
  }
  protected async onStart() {
    this.log.debug("onStart");
    if (this.substriptions) {
      await Promise.all(
        this.substriptions.map((item) => {
          return this.kernel.messaging.subscribeTopic(item, this);
        })
      );
    }
    this.log.debug("onStarted");
  }

  protected async onStop() {
    this.log.debug("onStop");
    if (this.substriptions) {
      await Promise.all(
        this.substriptions.map((item) =>
          this.kernel.messaging.unsubscribeTopic(item, this.fullName)
        )
      );
    }
    this.log.debug("onStopped");
  }

  protected async main(): Promise<number> {
    await this.waitForShutdown();
    return 0;
  }

  async onMessage(message: IMessageEvent) {}
}
