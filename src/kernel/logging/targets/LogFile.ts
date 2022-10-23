import { KernelElement } from "../../../shared/bases/KernelElement";
import { ILogTarget } from "../../../shared/logging/types/ILogTarget";
import { LogLevels } from "../../../shared/logging/types/LogLevels";
import { IKernel } from "../../../shared/kernel/IKernel";

export class LogTargetFile extends KernelElement implements ILogTarget {
  constructor(readonly kernel: IKernel, parent: KernelElement) {
    super("log-target-file", kernel, parent);
  }

  appendLog(level: LogLevels, ...parts: string[]): void {
    console.info("file", level, ...parts);
  }
}
