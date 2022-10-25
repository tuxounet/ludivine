import { ImperativeInterpreterApp } from "./interpreters/imperative";
import { NaturalInterpreterApp } from "./interpreters/natural";
import { bases, kernel, messaging } from "@ludivine/shared";

export class ShellApp extends bases.AppElement {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("shell", parent, kernel, ["/channels/input"]);

    this.imperativeInterpreter = new ImperativeInterpreterApp(
      this.kernel,
      this
    );
    this.naturalInterpreterApp = new NaturalInterpreterApp(this.kernel, this);
  }

  imperativeInterpreter: ImperativeInterpreterApp;
  naturalInterpreterApp: NaturalInterpreterApp;
  protected async main(): Promise<number> {
    await this.kernel.channels.broadcast("bonjour");
    await Promise.all([
      this.imperativeInterpreter.execute(),
      this.naturalInterpreterApp.execute(),
    ]);

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
        if (command.startsWith(this.imperativeInterpreter.imperativePrefix)) {
          await this.kernel.messaging.publish("/channels/input/imperative", {
            command,
            channel: message.body.channel,
          });
        } else {
          await this.kernel.messaging.publish("/channels/input/natural", {
            command,
            channel: message.body.channel,
          });
        }

        break;
    }
  }
}