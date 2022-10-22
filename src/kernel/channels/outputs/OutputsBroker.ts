import { KernelElement } from "../../bases/KernelElement";
import { Kernel } from "../../kernel";
import { IOutputChannel } from "../types/IOutputChannel";
import { CLIOutputChannel } from "./cli";
import { WebOutputChannel } from "./web";

export class OutputsBroker extends KernelElement {
  constructor(readonly kernel: Kernel, parent: KernelElement) {
    super("outputs-broker", parent);
    this.channels = [
      new CLIOutputChannel(kernel, this),
      new WebOutputChannel(kernel, this),
    ];
  }

  channels: IOutputChannel[];
}
