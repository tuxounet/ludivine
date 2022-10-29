import { kernel, logging } from "@ludivine/types";
import { bases } from "@ludivine/abstractions";
export class LogTargetConsole
  extends bases.KernelElement
  implements logging.ILogTarget
{
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("log-target-console", kernel, parent);
  }

  appendLog(line: logging.ILogLine): void {
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
