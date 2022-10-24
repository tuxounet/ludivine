import { KernelElement } from "../../../shared/bases/KernelElement";
import { IInputChannel } from "../../../shared/channels/IInputChannel";
import { IKernel } from "../../../shared/kernel/IKernel";
import { IKernelElement } from "../../../shared/kernel/IKernelElement";
import { CLIInputChannel } from "./cli";
import { HttpInputChannel } from "./http";

export class InputsBroker extends KernelElement {
  constructor(readonly kernel: IKernel, parent: IKernelElement) {
    super("inputs-broker", kernel, parent);
    this.channels = [
      new CLIInputChannel(kernel, this),
      new HttpInputChannel(kernel, this),
    ];
  }

  channels: IInputChannel[];
}
