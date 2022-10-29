import { kernel, channels } from "@ludivine/types";
import { CLIInputChannel } from "./cli";
import { HttpInputChannel } from "./http";
import { bases } from "@ludivine/abstractions";
export class InputsBroker extends bases.KernelElement {
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("inputs-broker", kernel, parent);
    this.channels = [
      new CLIInputChannel(kernel, this),
      new HttpInputChannel(kernel, this),
    ];
  }

  channels: channels.IInputChannel[];
}
