import { KernelElement } from "../../../../shared/bases/KernelElement";
import { Kernel } from "../../../kernel";

import { IOutputChannel } from "../../../../shared/channels/IOutputChannel";
import { IOutputMessage } from "../../../../shared/channels/IOutputMessage";

export class CLIOutputChannel extends KernelElement implements IOutputChannel {
  constructor(readonly kernel: Kernel, parent: KernelElement) {
    super("cli-output", parent);
    this.listening = false;
    this.opened = false;
  }

  opened: boolean;
  async open(): Promise<void> {
    this.opened = true;
  }

  async close(): Promise<void> {
    this.opened = false;
  }

  promptPrefix = "> ";
  listening: boolean;

  async output(message: IOutputMessage): Promise<void> {
    if (!this.opened) {
      return;
    }
    switch (message.type) {
      case "message":
        console.info("*", message.body);
        break;
      case "object":
        console.info("*", JSON.stringify(message.body));
        break;
    }
    this.log.debug("output complete", message);
  }
}
