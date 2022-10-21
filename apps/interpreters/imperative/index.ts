import { AppElement } from "../../../kernel/bases/AppElement";
import { KernelElement } from "../../../kernel/bases/KernelElement";
import { Kernel } from "../../../kernel/kernel";
import { IMessageEvent } from "../../../kernel/messaging/IMessageEvent";

export class ImperativeInterpreterApp extends AppElement {
  constructor(readonly kernel: Kernel, parent: KernelElement) {
    super("imperative-interpreter", parent, kernel, [
      "/channels/input/imperative",
    ]);
  }
  readonly imperativePrefix = "!";

  async onMessage(message: IMessageEvent) {
    this.log.debug(
      "message arrival",
      message.recipient,
      message.sender,
      message.body
    );
    switch (message.recipient) {
      case "/channels/input/imperative":
        await this.kernel.output(
          "commande imperative recu " +
            message.body.command +
            " depuis " +
            message.body.channel
        );
        await this.processCommand(message.body.command);
        break;
    }
  }

  private async processCommand(raw: string) {
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

    function walkToken(object: KernelElement, token: string) {
      for (const key in object) {
        const lowerKey = key.toLowerCase();
        if (lowerKey === token) {
          const anyBroker = object as any;
          const broker = anyBroker[key];
          return broker;
        }
      }
    }

    let broker: KernelElement = this.kernel;
    for (let i = 0; i < tokens.length; i++) {
      const result = walkToken(broker, tokens[i]);
      if (!result) {
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
        await this.kernel.output("command ok:" + cleanCommand + " : " + output);
        return;
      }
    }
    const possibleMethods = Object.keys(broker).filter((item) => {
      const anyBroker: any = broker;
      return (
        typeof anyBroker[item] === "function" ||
        anyBroker[item] instanceof KernelElement
      );
    });
    await this.kernel.output(
      "bad command : possible tokens " + possibleMethods.join(",")
    );
  }
}
