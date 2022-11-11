import { bases, kernel, logging } from "@ludivine/runtime";
import { LogTargetConsole } from "./targets/LogConsole";

export class InitialLogBroker
  extends bases.KernelElement
  implements logging.ILogsBroker
{
  targets: logging.ILogTarget[];
  level: logging.LogLevel;

  constructor(readonly kernel: kernel.IKernel) {
    super("logs", kernel);
    this.targets = [new LogTargetConsole(this)];
    this.level = logging.LogLevel.TRACE;
  }

  @logging.logMethod()
  async initialize(): Promise<void> {
    await Promise.all(
      this.targets.map(async (item) => await item.initialize())
    );
  }

  @logging.logMethod()
  async shutdown(): Promise<void> {
    await Promise.all(this.targets.map(async (item) => await item.shutdown()));
  }

  output = (line: logging.ILogLine): void => {
    if (line.level.valueOf() < this.level.valueOf()) return;
    if (this.targets.length > 0)
      this.targets.forEach((target) => target.appendLog(line));
  };
}
