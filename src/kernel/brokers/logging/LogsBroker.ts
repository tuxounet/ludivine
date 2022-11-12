import { bases, logging, kernel, storage } from "@ludivine/runtime";
import { LogTargetConsole } from "./targets/LogConsole";
import { LogTargetFile } from "./targets/LogFile";

export class LogsBroker
  extends bases.KernelElement
  implements logging.ILogsBroker
{
  targets: logging.ILogTarget[];
  level: logging.LogLevel;

  storage: storage.IStorageBroker;

  constructor(readonly kernel: kernel.IKernel) {
    super("logs", kernel);
    this.storage = kernel.container.get("storage");
    this.targets = [new LogTargetFile(this), new LogTargetConsole(this)];
    this.level = logging.LogLevel.TRACE;
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
    if (line.level.valueOf() < this.level.valueOf()) return;
    if (this.targets.length > 0)
      this.targets.forEach((target) => target.appendLog(line));
  }
}
