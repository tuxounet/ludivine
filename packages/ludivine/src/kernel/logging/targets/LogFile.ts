import { KernelElement } from "../../../shared/bases/KernelElement";
import { IKernel } from "../../../shared/kernel/IKernel";
import { IKernelElement } from "../../../shared/kernel/IKernelElement";
import { ILogLine } from "../../../shared/logging/types/ILogLine";
import { ILogTimeFormat } from "../../../shared/logging/types/ILogTimeFormat";
import { ILogTarget } from "../../../shared/logging/_index";
import { Queue } from "../../messaging/Queue";

export class LogTargetFile extends KernelElement implements ILogTarget {
  constructor(readonly kernel: IKernel, parent: IKernelElement) {
    super("log-target-file", kernel, parent);

    this.queue = new Queue("logging", kernel, this);
  }

  private outputInterval?: NodeJS.Timer;
  queue: Queue<ILogLine>;
  private readonly LOG_VOLUME_NAME = "logs";
  private readonly WRITE_DEQUEUE_INTERNAL = 200;
  private readonly LOG_RETENTION_HOURS = 24;
  private readonly LOG_FILENAME_SUFFIX = "-ludivine.log";
  appendLog(line: ILogLine): void {
    this.queue.enqueue(line);
  }

  async initialize(): Promise<void> {
    this.outputInterval = setTimeout(() => {
      this.dequeueLogs().catch((e) =>
        this.log.error("file output loop failed", e)
      );
      this.purgeLogFiles().catch((e) =>
        this.log.error("file output log purge failed", e)
      );
    }, this.WRITE_DEQUEUE_INTERNAL);
  }

  async shutdown(): Promise<void> {
    clearTimeout(this.outputInterval);
  }

  private async dequeueLogs(): Promise<void> {
    const buffer: ILogLine[] = [];

    while (this.queue.canDequeue() && buffer.length < 20) {
      const line = this.queue.dequeue();
      buffer.push(line);
    }
    await this.appendLines(buffer);
    if (this.kernel.started)
      this.outputInterval = setTimeout(() => {
        this.dequeueLogs().catch((e) =>
          this.log.error("file output loop failed", e)
        );
      }, this.WRITE_DEQUEUE_INTERNAL);
  }

  private async appendLines(lines: ILogLine[]): Promise<boolean> {
    const logVolume = await this.kernel.storage.getVolume(this.LOG_VOLUME_NAME);
    let dump = lines
      .map((item) => {
        return `${item.date} ${item.level} ${item.sender} ${item.line}`;
      })
      .join("\n");

    if (lines.length > 0) {
      dump += "\n";
    }
    const timeSegments = this.toTimeLogsString();

    return await logVolume.fileSystem.appendFile(
      `${timeSegments}${this.LOG_FILENAME_SUFFIX}`,
      Buffer.from(dump, "utf-8")
    );
  }

  private async purgeLogFiles(): Promise<void> {
    const logVolume = await this.kernel.storage.getVolume(this.LOG_VOLUME_NAME);
    const allFiles = await logVolume.fileSystem.list("");
    const allLogsFiles = allFiles
      .filter((item) => item.path.endsWith(this.LOG_FILENAME_SUFFIX))
      .map((item) => {
        return {
          item,
          timeLogString: item.path.replace(this.LOG_FILENAME_SUFFIX, "").trim(),
        };
      })
      .map((item) => {
        return {
          ...item,
          timeLog: this.parseTimeLogsString(item.timeLogString),
        };
      })
      .filter((item) => item.timeLog !== undefined)
      .map((item) => {
        return {
          ...item,
          date:
            item.timeLog != null
              ? new Date(
                  parseInt(item.timeLog.YYYY),
                  parseInt(item.timeLog.MM),
                  parseInt(item.timeLog.DD),
                  parseInt(item.timeLog.HH),
                  0
                ).getTime()
              : 0,
        };
      });

    const now = new Date();
    const retentionLimit = new Date(
      now.getTime() - this.LOG_RETENTION_HOURS * 60 * 60 * 1000
    ).getTime();
    const purgables = allLogsFiles.filter((item) => item.date < retentionLimit);

    await Promise.all(
      purgables.map(
        async (item) => await logVolume.fileSystem.deleteFile(item.item.path)
      )
    );
  }

  private toTimeLogsString(timestamp?: Date): string {
    if (timestamp == null) timestamp = new Date();
    const format = this.serializeTimeLogString(timestamp);
    return `${format.YYYY}-${format.MM}-${format.DD}-${format.HH}`;
  }

  private serializeTimeLogString(timestamp: Date): ILogTimeFormat {
    const formatData = (input: number): string => {
      if (input > 9) {
        return String(input);
      } else return `0${input}`;
    };

    const format: ILogTimeFormat = {
      YYYY: String(timestamp.getFullYear()),
      MM: formatData(timestamp.getMonth()),
      DD: formatData(timestamp.getDate()),
      HH: formatData(timestamp.getHours()),
    };
    return format;
  }

  private parseTimeLogsString(input: string): ILogTimeFormat | undefined {
    if (input == null || input.length === 0 || input.trim().length === 0) {
      return undefined;
    }
    const tokens = input.split("-");
    if (tokens.length !== 4) return undefined;
    const result: ILogTimeFormat = {
      YYYY: tokens[0].trim(),
      MM: tokens[1].trim(),
      DD: tokens[2].trim(),
      HH: tokens[3].trim(),
    };
    return result;
  }
}