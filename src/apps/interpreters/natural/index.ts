import { AppElement } from "../../../kernel/bases/AppElement";
import { KernelElement } from "../../../kernel/bases/KernelElement";
import { Kernel } from "../../../kernel/kernel";
import { IMessageEvent } from "../../../kernel/messaging/IMessageEvent";
import path from "path";
export class NaturalInterpreterApp extends AppElement {
  constructor(readonly kernel: Kernel, parent: KernelElement) {
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
        await this.kernel.channels.outputOnAll(
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

    await this.kernel.channels.outputOnAll(
      "interpretation de la commande: " + helloPythonProject.output
    );
  }
}
