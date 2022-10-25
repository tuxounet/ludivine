import { KernelElement } from "../../../shared/bases/KernelElement";
import { IOutputChannel } from "../../../shared/channels/IOutputChannel";
import { IKernel } from "../../../shared/kernel/IKernel";
import { IKernelElement } from "../../../shared/kernel/IKernelElement";
import { CLIOutputChannel } from "./cli";
import { WebPushOutputChannel } from "./push";
import { WebOutputChannel } from "./web";

export class OutputsBroker extends kernel.KernelElement {
  constructor(readonly kernel: kernel.IKernel, parent: IKernelElement) {
    super("outputs-broker", kernel, parent);
    this.channels = [
      new CLIOutputChannel(kernel, this),
      new WebOutputChannel(kernel, this),
      new WebPushOutputChannel(kernel, this),
    ];
  }

  channels: IOutputChannel[];
}
