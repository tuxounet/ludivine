import { KernelElement } from "../bases/KernelElement";
import { Kernel } from "../kernel";
import { InputsBroker } from "./inputs/inputsBroker";
import { OutputsBroker } from "./outputs/OutputsBroker";

export class ChannelsBroker extends KernelElement {
  inputs: InputsBroker;
  outputs: OutputsBroker;

  constructor(readonly kernel: Kernel) {
    super("channels", kernel);
    this.inputs = new InputsBroker(kernel, this);
    this.outputs = new OutputsBroker(kernel, this);
  }

  async initialize() {
    await Promise.all(
      this.inputs.channels.map((item) => item.initialize && item.initialize())
    );
    await Promise.all(
      this.outputs.channels.map((item) => item.initialize && item.initialize())
    );
  }

  async destroy() {
    await Promise.all(
      this.inputs.channels
        .reverse()
        .map((item) => item.destroy && item.destroy())
    );
  }

  async openAllInputs() {
    await Promise.all(this.inputs.channels.map((item) => item.open()));
  }
  async openAllOutputs() {
    await Promise.all(this.outputs.channels.map((item) => item.open()));
  }

  async closeAllInputs() {
    await Promise.all(this.inputs.channels.map((item) => item.close()));
  }

  async closeAllOutputs() {
    await Promise.all(this.outputs.channels.map((item) => item.close()));
  }

  outputOnAll = async (message: string) => {
    await Promise.all(
      this.outputs.channels.map((item) => item.output(message))
    );
  };
}
