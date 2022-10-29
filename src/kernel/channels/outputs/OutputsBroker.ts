import { bases, kernel, channels } from "@ludivine/runtime";
import { CLIOutputChannel } from "./cli";
import { WebOutputChannel } from "./web";
export class OutputsBroker extends bases.KernelElement {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("outputs-broker", kernel, parent);
    this.channels = [
      new CLIOutputChannel(kernel, this),
      new WebOutputChannel(kernel, this),
    ];
  }

  channels: channels.IOutputChannel[];
}
