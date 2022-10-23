import { KernelElement } from "../../shared/bases/KernelElement";

import { LogTargetConsole } from "./targets/LogConsole";
import { LogTargetFile } from "./targets/LogFile";
import { ILogTarget } from "../../shared/logging/types/ILogTarget";
import { ILogBroker } from "../../shared/logging/ILogBroker";
import { IKernel } from "../../shared/kernel/IKernel";
import { ILogLine } from "../../shared/logging/types/ILogLine";

export class LogBroker extends KernelElement implements ILogBroker {
  constructor(readonly kernel: IKernel) {
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

  output(line: ILogLine): void {
    this.targets.forEach((target) => target.appendLog(line));
  }

  targets: ILogTarget[];
}
