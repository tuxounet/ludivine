import { bases, kernel, messaging, logging, sessions } from "@ludivine/runtime";

export class ShellApp extends bases.AppElement {
  constructor(readonly session: sessions.ISession) {
    super("shell", session);
  }

  readonly imperativePrefix = "!";

  protected async main(): Promise<number> {
    await this.session.output({ type: "message", body: "bonjour" });

    while (this.kernel.started) {
      const inputMessage = await this.session.input({ prompt: ">" });
      console.info("hoho", inputMessage);
      if (inputMessage === undefined || inputMessage.value === undefined) {
        await this.session.output({ type: "message", body: "commande vide" });
        continue;
      }
      const inputLine = String(inputMessage.value);
      console.info("!!!!!", inputLine);
      if (inputLine.startsWith(this.imperativePrefix)) {
        await this.processCommand(inputLine);
        break;
      } else {
        await this.kernel.messaging.publish("/channels/input/natural", {
          command: inputLine,
        });
      }

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
      continue;
    }
    return 0;
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
        await this.session.output({
          type: "message",
          body: "command ok:" + String(cleanCommand) + " : " + String(output),
        });

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
    await this.session.output({
      type: "message",
      body:
        "command ok:" +
        "bad command : possible tokens " +
        possibleMethods.join(","),
    });
  }
}
