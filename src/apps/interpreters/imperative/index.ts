import { bases, kernel, messaging } from "@ludivine/shared";

export class ImperativeInterpreterApp extends bases.AppElement {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("imperative-interpreter", parent, kernel, [
      "/channels/input/imperative",
    ]);
  }

  readonly imperativePrefix = "!";

  async onMessage(message: messaging.IMessageEvent): Promise<void> {
    this.log.debug(
      "message arrival",
      message.recipient,
      message.sender,
      message.body
    );
    switch (message.recipient) {
      case "/channels/input/imperative":
        await this.kernel.channels.broadcast(
          "commande imperative recu " +
            message.body.command +
            " depuis " +
            message.body.channel
        );
        await this.processCommand(message.body.command);
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