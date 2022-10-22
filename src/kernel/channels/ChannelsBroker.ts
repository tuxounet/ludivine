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
      this.inputs.channels.map(
        (item) => item.initialize != null && item.initialize()
      )
    );
    await Promise.all(
      this.outputs.channels.map(
        (item) => item.initialize != null && item.initialize()
      )
    );
  }

  async destroy() {
    await Promise.all(
      this.inputs.channels
        .reverse()
        .map((item) => item.destroy != null && item.destroy())
    );
  }

  async openAllInputs() {
    await Promise.all(
      this.inputs.channels.map(async (item) => await item.open())
    );
  }

  async openAllOutputs() {
    await Promise.all(
      this.outputs.channels.map(async (item) => await item.open())
    );
  }

  async closeAllInputs() {
    await Promise.all(
      this.inputs.channels.map(async (item) => await item.close())
    );
  }

  async closeAllOutputs() {
    await Promise.all(
      this.outputs.channels.map(async (item) => await item.close())
    );
  }

  outputOnAll = async (message: string) => {
    await Promise.all(
      this.outputs.channels.map(async (item) => await item.output(message))
    );
  };
}
