import { bases, kernel, channels } from "@ludivine/shared";
import { CLIOutputChannel } from "./cli";
import { WebPushOutputChannel } from "./push";
import { WebOutputChannel } from "./web";

export class OutputsBroker extends bases.KernelElement {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("outputs-broker", kernel, parent);
    this.channels = [
      new CLIOutputChannel(kernel, this),
      new WebOutputChannel(kernel, this),
      new WebPushOutputChannel(kernel, this),
    ];
  }

  channels: channels.IOutputChannel[];
}
