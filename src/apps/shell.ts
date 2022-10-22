import { AppElement } from "../kernel/bases/AppElement";
import { KernelElement } from "../kernel/bases/KernelElement";
import { Kernel } from "../kernel/kernel";
import { IMessageEvent } from "../kernel/messaging/IMessageEvent";
import { ImperativeInterpreterApp } from "./interpreters/imperative";
import { NaturalInterpreterApp } from "./interpreters/natural";

export class ShellApp extends AppElement {
  constructor(readonly kernel: Kernel, parent: KernelElement) {
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
    await this.kernel.output("bonjour");
    await Promise.all([
      this.imperativeInterpreter.execute(),
      this.naturalInterpreterApp.execute(),
    ]);

    await this.kernel.output("au revoir");
    return 0;
  }

  async onMessage(message: IMessageEvent) {
    this.log.debug(
      "message arrival",
      message.recipient,
      message.sender,
      message.body
    );
    switch (message.recipient) {
      case "/channels/input":
        if (!message.body.command || message.body.command.trim() === "") {
          this.log.warn("commade vide");
          return;
        }
        const command = message.body.command.trim();
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
