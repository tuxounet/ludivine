import { bases, kernel, logging } from "@tuxounet/ludivine-shared";
import { LogTargetConsole } from "./targets/LogConsole";
import { LogTargetFile } from "./targets/LogFile";

export class LogBroker
  extends bases.KernelElement
  implements logging.ILogBroker
{
  targets: logging.ILogTarget[];

  constructor(readonly kernel: kernel.IKernel) {
    super("logs", kernel);
    this.targets = [
      new LogTargetFile(kernel, this),
      new LogTargetConsole(kernel, this),
    ];
  }

  async initialize(): Promise<void> {
    await Promise.all(
      this.targets.map(async (item) => await item.initialize())
    );
  }

  async shutdown(): Promise<void> {
    await Promise.all(this.targets.map(async (item) => await item.shutdown()));
  }

  output(line: logging.ILogLine): void {
    this.targets.forEach((target) => target.appendLog(line));
  }
}
