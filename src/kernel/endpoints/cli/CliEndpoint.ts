import {
  bases,
  channels,
  endpoints,
  kernel,
  sessions,
} from "@ludivine/runtime";
import readline from "readline";
export class CliEndpoint
  extends bases.KernelElement
  implements endpoints.IEndpoint
{
  constructor(
    readonly session: sessions.ISession,
    parent: kernel.IKernelElement
  ) {
    super("cli-endpoint", session.kernel, parent);
  }

  async emitOutput(output: channels.IOutputMessage): Promise<void> {
    switch (output.type) {
      case "message":
        console.info("*", output.body);
        break;
      case "object":
        console.info("*", JSON.stringify(output.body));
        break;
    }
  }

  async emitEvent(output: channels.IEventMessage): Promise<void> {
    switch (output.type) {
      case "input":
        setTimeout(() => {
          const currentRl = readline.createInterface({
            input: process.stdin,
          });
          const datas = JSON.parse(output.body);

          currentRl.question(
            `${String(datas.sequence)} ${String(datas.query.prompt)} `,
            (response) => {
              if (currentRl != null) currentRl.close();

              this.kernel.messaging
                .publish("/sessions/" + this.session.id, {
                  session: this.session.id,
                  sequence: datas.sequence,
                  sender: this.fullName,
                  value: response,
                  type: "line",
                })
                .catch((e) => this.log.error(e));
            }
          );
        });
        break;
    }
    return await Promise.resolve();
  }
}