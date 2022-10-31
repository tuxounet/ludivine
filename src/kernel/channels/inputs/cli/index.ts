import readline from "readline";
import { bases, kernel, channels } from "@ludivine/runtime";
export class CLIInputChannel extends bases.KernelElement {
  // implements channels.IInputChannel
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("cli-input", kernel, parent);
    this.opened = false;
  }

  promptPrefix = "> ";
  opened: boolean;
  protected currentRl?: readline.Interface;
  async open(): Promise<void> {
    // if (this.opened) {
    //   await this.close();
    // }
    // this.opened = true;
    // const loop = async (): Promise<void> => {
    //   if (this.opened) {
    //     await new Promise<channels.IChannelInputResult>((resolve, reject) => {
    //       this.currentRl = readline.createInterface({
    //         input: process.stdin,
    //         output: process.stdout,
    //       });
    //       this.log.debug("reading stdin");
    //       try {
    //         let value: string;
    //         this.currentRl.on("close", () => {
    //           if (value === undefined) {
    //             value = "";
    //           }
    //           this.kernel.messaging
    //             .publish("/channels/input", {
    //               command: value,
    //               channel: this.name,
    //             })
    //             .then(() => {
    //               this.currentRl = undefined;
    //               resolve({
    //                 raw: value,
    //                 sender: this,
    //               });
    //             })
    //             .catch((e) => {
    //               reject(e);
    //             });
    //         });
    //         this.currentRl.question(this.promptPrefix, (response) => {
    //           value = response;
    //           if (this.currentRl != null) this.currentRl.close();
    //         });
    //       } catch (e) {
    //         reject(e);
    //       }
    //     });
    //     await loop();
    //   }
    // };
    // loop().catch((err) => this.log.error("initial loop failed", err));
  }

  async close(): Promise<void> {
    if (this.currentRl != null) {
      this.currentRl.close();
      this.currentRl = undefined;
    }
    this.opened = false;
  }
}
