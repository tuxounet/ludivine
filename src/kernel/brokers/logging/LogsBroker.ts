import { bases, logging, kernel } from "@ludivine/runtime";
import { LogTargetConsole } from "./targets/LogConsole";
import { LogTargetFile } from "./targets/LogFile";

export class LogsBroker
  extends bases.KernelElement
  implements logging.ILogsBroker
{
  targets: logging.ILogTarget[];

  constructor(readonly kernel: kernel.IKernel) {
    super("logs", kernel);

    this.targets = [new LogTargetConsole(this), new LogTargetFile(this)];
  }

  @logging.logMethod()
  async initialize(): Promise<void> {
    await Promise.all(
      this.targets.map(async (item) => await item.initialize())
    );

    this.enableFile();
    await super.initialize();
  }

  @logging.logMethod()
  async shutdown(): Promise<void> {
    await Promise.all(this.targets.map(async (item) => await item.shutdown()));
    await super.shutdown();
  }

  @logging.logMethod()
  private enableFile(): boolean {
    const fileTarget = this.targets.find(
      (item) => item instanceof LogTargetFile
    );
    if (fileTarget === undefined) {
      return false;
    }
    (fileTarget as LogTargetFile).enablePersistence();

    return true;
  }

  @logging.logMethod()
  private disableFile(): boolean {
    const fileTarget = this.targets.find(
      (item) => item instanceof LogTargetFile
    );
    if (fileTarget === undefined) {
      return false;
    }
    (fileTarget as LogTargetFile).disablePersistance();

    return true;
  }

  output(line: logging.ILogLine): void {
    if (this.targets.length > 0)
      this.targets.forEach((target) => target.appendLog(line));
  }
}
