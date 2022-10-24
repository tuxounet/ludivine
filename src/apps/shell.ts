import { AppElement } from "../shared/bases/AppElement";
import { IKernel } from "../shared/kernel/IKernel";
import { IKernelElement } from "../shared/kernel/IKernelElement";
import { IMessageEvent } from "../shared/messaging/IMessageEvent";

import { ImperativeInterpreterApp } from "./interpreters/imperative";
import { NaturalInterpreterApp } from "./interpreters/natural";

export class ShellApp extends AppElement {
  constructor(readonly kernel: IKernel, parent: IKernelElement) {
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

  async onMessage(message: IMessageEvent): Promise<void> {
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
