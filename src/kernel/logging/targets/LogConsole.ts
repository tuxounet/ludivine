import { KernelElement } from "../../../shared/bases/KernelElement";
import { IKernel } from "../../../shared/kernel/IKernel";
import { IKernelElement } from "../../../shared/kernel/IKernelElement";
import { ILogLine } from "../../../shared/logging/types/ILogLine";
import { ILogTarget } from "../../../shared/logging/_index";

export class LogTargetConsole extends KernelElement implements ILogTarget {
  constructor(readonly kernel: IKernel, parent: IKernelElement) {
    super("log-target-console", kernel, parent);
  }

  appendLog(line: ILogLine): void {
    switch (line.level) {
      case "DEBUG":
        return console.debug(line.date, "DBG", line.sender, line.line);
      case "INPUT":
        return console.info(line.date, "INP", line.sender, line.line);
      case "INFO":
        return console.info(line.date, "INF", line.sender, line.line);
      case "WARN":
        return console.warn(line.date, "WRN", line.sender, line.line);
      case "ERROR":
        return console.error(line.date, "ERR", line.sender, line.line);
      default:
        console.debug(line.date, "???", line.sender, line.line);
    }
  }
}
