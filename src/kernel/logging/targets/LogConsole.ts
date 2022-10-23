import { KernelElement } from "../../../shared/bases/KernelElement";
import { IKernel } from "../../../shared/kernel/IKernel";

import { ILogTarget } from "../../../shared/logging/types/ILogTarget";
import { LogLevels } from "../../../shared/logging/types/LogLevels";

export class LogTargetConsole extends KernelElement implements ILogTarget {
  constructor(readonly kernel: IKernel, parent: KernelElement) {
    super("log-target-console", kernel, parent);
  }

  appendLog(level: LogLevels, ...parts: string[]): void {
    console.info("console", level, ...parts);
  }
}
