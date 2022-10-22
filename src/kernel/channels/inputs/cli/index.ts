import readline from "readline";
import { KernelElement } from "../../../bases/KernelElement";
import { Kernel } from "../../../kernel";
import { IChannelInputResult, IInputChannel } from "../../types/IInputChannel";

export class CLIInputChannel extends KernelElement implements IInputChannel {
  constructor(readonly kernel: Kernel, parent: KernelElement) {
    super("cli-input", parent);
    this.opened = false;
  }

  promptPrefix = "> ";
  opened: boolean;
  protected currentRl?: readline.Interface;
  async open(): Promise<void> {
    this.opened = true;
    const loop = async () => {
      if (this.opened) {
        await new Promise<IChannelInputResult>((resolve, reject) => {
          this.currentRl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          this.log.debug("reading stdin");
          try {
            let value: string;
            this.currentRl.on("close", () => {
              if (!value) {
                value = "";
              }
              this.kernel.messaging
                .publish("/channels/input", {
                  command: value,
                  channel: this.name,
                })
                .then(() => {
                  this.currentRl = undefined;
                  resolve({
                    raw: value,
                    sender: this,
                  });
                })
                .catch((e) => {
                  reject(e);
                });
            });

            this.currentRl.question(this.promptPrefix, (response) => {
              value = response;
              if (this.currentRl != null) this.currentRl.close();
            });
          } catch (e) {
            reject(e);
          }
        });
        loop();
      }
    };
    loop();
  }

  async close(): Promise<void> {
    if (this.currentRl != null) {
      this.currentRl.close();
      this.currentRl = undefined;
    }
    this.opened = false;
  }
}
