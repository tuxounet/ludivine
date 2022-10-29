import { bases, kernel, channels } from "@ludivine/runtime";
export class CLIOutputChannel
  extends bases.KernelElement
  implements channels.IOutputChannel
{
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("cli-output", kernel, parent);
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

  async output(message: channels.IOutputMessage): Promise<void> {
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
