import { KernelElement } from "../../shared/bases/KernelElement";

import { LogTargetConsole } from "./targets/LogConsole";
import { LogTargetFile } from "./targets/LogFile";
import { ILogTarget } from "../../shared/logging/types/ILogTarget";
import { ILogBroker } from "../../shared/logging/ILogBroker";
import { IKernel } from "../../shared/kernel/IKernel";
import { LogLevels } from "../../shared/logging/_index";

export class LogBroker extends KernelElement implements ILogBroker {
  constructor(readonly kernel: IKernel) {
    super("logs", kernel);
    this.targets = [
      new LogTargetFile(kernel, this),
      new LogTargetConsole(kernel, this),
    ];
  }

  output(level: LogLevels, line: string): void {
    this.targets.forEach((target) => target.appendLog(level, line));
  }

  targets: ILogTarget[];
}
