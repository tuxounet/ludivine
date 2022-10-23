import { KernelElement } from "../../../bases/KernelElement";
import { Kernel } from "../../../kernel";

import { IOutputChannel } from "../../types/IOutputChannel";
import { IOutputMessage } from "../../types/IOutputMessage";

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
    this.log.debug("output arrival", message);
    if (this.opened) {
      console.info("*", message);
    }
  }
}
