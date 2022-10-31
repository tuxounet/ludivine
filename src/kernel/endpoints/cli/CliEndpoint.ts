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

  async emitOutput(output: channels.IOutputMessage) {
    switch (output.type) {
      case "message":
        console.info("*", output.body);
        break;
      case "object":
        console.info("*", JSON.stringify(output.body));
        break;
    }
  }

  emitEvent(output: channels.IEventMessage): Promise<void> {
    switch (output.type) {
      case "input":
        setTimeout(() => {
          let currentRl = readline.createInterface({
            input: process.stdin,
          });
          const datas = JSON.parse(output.body);

          currentRl.question(
            `${datas.sequence} ${datas.query.prompt} `,
            (response) => {
              if (currentRl != null) currentRl.close();

              this.kernel.messaging.publish("/sessions/" + this.session.id, {
                session: this.session.id,
                sequence: datas.sequence,
                sender: this.fullName,
                value: response,
                type: "line",
              });
            }
          );
        });
        break;
    }
    return Promise.resolve();
  }
}
