import { KernelElement } from "../../../shared/bases/KernelElement";
import { IOutputChannel } from "../../../shared/channels/IOutputChannel";
import { CLIOutputChannel } from "./cli";
import { WebOutputChannel } from "./web";
import { IKernel } from "../../../shared/kernel/IKernel";
import { IKernelElement } from "../../../shared/kernel/IKernelElement";

export class OutputsBroker extends KernelElement {
  constructor(readonly kernel: IKernel, parent: IKernelElement) {
    super("outputs-broker", kernel, parent);
    this.channels = [
      new CLIOutputChannel(kernel, this),
      new WebOutputChannel(kernel, this),
    ];
  }

  channels: IOutputChannel[];
}
