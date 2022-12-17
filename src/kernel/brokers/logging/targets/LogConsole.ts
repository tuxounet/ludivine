import { bases, logging } from "@ludivine/runtime";
export class LogTargetConsole
  extends bases.KernelElement
  implements logging.ILogTarget
{
  constructor(readonly parent: logging.ILogsBroker) {
    super("log-target-console", parent.kernel, parent);
    this.level = logging.LogLevel.DEBUG;
  }
  level: logging.LogLevel;

  appendLog(line: logging.ILogLine): void {
    if (line.level >= this.level) {
      switch (line.level) {
        case logging.LogLevel.TRACE:
          return console.debug(line.date, "TRA", line.sender, line.line);
        case logging.LogLevel.DEBUG:
          return console.debug(line.date, "DBG", line.sender, line.line);
        case logging.LogLevel.INPUT:
          return console.info(line.date, "INP", line.sender, line.line);
        case logging.LogLevel.INFO:
          return console.info(line.date, "INF", line.sender, line.line);
        case logging.LogLevel.WARN:
          return console.warn(line.date, "WRN", line.sender, line.line);
        case logging.LogLevel.ERROR:
          return console.error(line.date, "ERR", line.sender, line.line);
        default:
          console.debug(line.date, "???", line.sender, line.line);
      }
    }
  }
}
