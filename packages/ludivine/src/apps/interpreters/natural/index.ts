import path from "path";
import { AppElement } from "../../../shared/bases/AppElement";
import { IKernel } from "../../../shared/kernel/IKernel";
import { IKernelElement } from "../../../shared/kernel/IKernelElement";
import { IMessageEvent } from "../../../shared/messaging/IMessageEvent";
export class NaturalInterpreterApp extends AppElement {
  constructor(readonly kernel: IKernel, parent: IKernelElement) {
    super("natural-interpreter", parent, kernel, ["/channels/input/natural"]);
  }

  protected async main(): Promise<number> {
    // load catalogs

    await this.waitForShutdown();
    return 0;
  }

  async onMessage(message: IMessageEvent): Promise<void> {
    this.log.debug(
      "message arrival",
      message.recipient,
      message.sender,
      message.body
    );
    switch (message.recipient) {
      case "/channels/input/natural":
        await this.kernel.channels.broadcast(
          "commande natural recu " +
            message.body.command +
            " depuis " +
            message.body.channel
        );
        await this.processNaturalCommand(message.body.command);
    }
  }

  protected async processNaturalCommand(command: string): Promise<void> {
    const helloPythonProject = await this.kernel.compute.executeProject(
      "python-local",
      {
        name: "nlp",
        dependencies: [{ name: "nltk" }],
        extensions: [".py", ".txt"],
        path: path.resolve(__dirname, "assets"),
        entryPoint: "nlp.py",
        args: [command],
      }
    );

    await this.kernel.channels.broadcast(
      "interpretation de la commande: " + helloPythonProject.output
    );
  }
}
