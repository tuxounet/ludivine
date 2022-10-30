import { bases, kernel, messaging, logging } from "@ludivine/runtime";

export class ShellApp extends bases.AppElement {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("shell", kernel, parent, ["/channels/input"]);
  }

  readonly imperativePrefix = "!";

  protected async main(): Promise<number> {
    await this.kernel.channels.broadcast("bonjour");
    await this.waitForShutdown();
    await this.kernel.channels.broadcast("au revoir");
    return 0;
  }

  async onMessage(message: messaging.IMessageEvent): Promise<void> {
    this.log.debug(
      "message arrival",
      message.recipient,
      message.sender,
      message.body
    );
    if (
      message.body === undefined ||
      message.body.command === undefined ||
      message.body.command === "" ||
      message.body.command.trim() === ""
    ) {
      this.log.warn("commade vide");
      return;
    }
    const command = message.body.command;

    switch (message.recipient) {
      case "/channels/input":
        if (command.startsWith(this.imperativePrefix)) {
          await this.processCommand(command);
        } else
          await this.kernel.messaging.publish(
            "/channels/input/natural",
            message.body
          );
        break;
    }
  }

  private async processCommand(raw: string): Promise<void> {
    const cleanCommand = raw.replace(this.imperativePrefix, "").trim();

    const tokens = cleanCommand
      .toLowerCase()
      .split(" ")
      .filter(
        (item) => item !== undefined && item !== "" && item.trim() !== ""
      );

    switch (tokens[0]) {
      case "stop":
      case "exit":
        return await this.kernel.askShutdown();
    }

    function walkToken(
      object: kernel.IKernelElement | kernel.IKernel,
      token: string
    ): any {
      for (const key in object) {
        const lowerKey = key.toLowerCase();
        if (lowerKey === token) {
          const anyBroker = object as any;
          const broker = anyBroker[key];
          return broker;
        }
      }
    }

    let broker: kernel.IKernelElement | kernel.IKernel = this.kernel;
    for (let i = 0; i < tokens.length; i++) {
      const result = walkToken(broker, tokens[i]);
      if (result === undefined) {
        break;
      }
      if (typeof result === "object") {
        broker = result;
        continue;
      }

      if (typeof result === "function") {
        let args: any[] = [];
        if (i + 1 < tokens.length) {
          args = tokens.filter((item, index) => index > i);
        }

        const output = await result.apply(broker, args);
        await this.kernel.channels.broadcast(
          "command ok:" + String(cleanCommand) + " : " + String(output)
        );
        return;
      }
    }
    const possibleMethods = Object.keys(broker).filter((item) => {
      const anyBroker: any = broker;
      return (
        typeof anyBroker[item] === "function" ||
        Object.keys(anyBroker[item]).includes("fullName")
      );
    });
    await this.kernel.channels.broadcast(
      "bad command : possible tokens " + possibleMethods.join(",")
    );
  }
}
