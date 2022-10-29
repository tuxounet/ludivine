import { kernel, channels } from "@ludivine/types";
import { CLIOutputChannel } from "./cli";
import { WebPushOutputChannel } from "./push";
import { WebOutputChannel } from "./web";
import { bases } from "@ludivine/abstractions";
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
