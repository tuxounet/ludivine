import readline from "readline";
import { KernelElement } from "../../../bases/KernelElement";
import { Kernel } from "../../../kernel";

import { IOutputChannel } from "../../types/IOutputChannel";

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

  async output(message: string): Promise<void> {
    this.log.debug("output arrival", message);
    if (this.opened) {
      console.info("*", message);
    }
  }
}
