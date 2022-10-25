import { bases, kernel, channels } from "@ludivine/shared";

import { InputsBroker } from "./inputs/inputsBroker";
import { OutputsBroker } from "./outputs/OutputsBroker";

export class ChannelsBroker
  extends bases.KernelElement
  implements channels.IChannelsBroker
{
  inputs: InputsBroker;
  outputs: OutputsBroker;

  constructor(readonly kernel: kernel.IKernel) {
    super("channels", kernel);
    this.inputs = new InputsBroker(kernel, this);
    this.outputs = new OutputsBroker(kernel, this);
  }

  async initialize(): Promise<void> {
    await Promise.all(
      this.inputs.channels.map(async (item) => await item.initialize())
    );
    await Promise.all(
      this.outputs.channels.map(async (item) => await item.initialize())
    );

    await this.openAllInputs();
    await this.openAllOutputs();

    await super.initialize();
  }

  async shutdown(): Promise<void> {
    await this.closeAllInputs();
    await this.closeAllOutputs();

    await Promise.all(
      this.inputs.channels.reverse().map(async (item) => await item.shutdown())
    );

    await Promise.all(
      this.outputs.channels.reverse().map(async (item) => await item.shutdown())
    );
    await super.shutdown();
  }

  openAllInputs = async (): Promise<void> => {
    await Promise.all(
      this.inputs.channels.map(async (item) => await item.open())
    );
  };

  openAllOutputs = async (): Promise<void> => {
    await Promise.all(
      this.outputs.channels.map(async (item) => await item.open())
    );
  };

  closeAllInputs = async (): Promise<void> => {
    await Promise.all(
      this.inputs.channels.map(async (item) => await item.close())
    );
  };

  closeAllOutputs = async (): Promise<void> => {
    await Promise.all(
      this.outputs.channels.map(async (item) => await item.close())
    );
  };

  broadcast = async (message: string): Promise<void> => {
    await this.outputOnAll({
      type: "message",
      body: message,
    });
  };

  outputOnAll = async (message: channels.IOutputMessage): Promise<void> => {
    await Promise.all(
      this.outputs.channels.map(async (item) => await item.output(message))
    );
  };
}