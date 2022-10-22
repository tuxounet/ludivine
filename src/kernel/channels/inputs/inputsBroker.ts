import { KernelElement } from "../../bases/KernelElement";
import { Kernel } from "../../kernel";
import { IInputChannel } from "../types/IInputChannel";
import { CLIInputChannel } from "./cli";
import { HttpInputChannel } from "./http";

export class InputsBroker extends KernelElement {
  constructor(readonly kernel: Kernel, parent: KernelElement) {
    super("inputs-broker", parent);
    this.channels = [
      new CLIInputChannel(kernel, this),
      new HttpInputChannel(kernel, this),
    ];
  }
  channels: IInputChannel[];
}
