import { KernelElement } from "../../../shared/bases/KernelElement";
import { ILogTarget } from "../../../shared/logging/types/ILogTarget";
import { IKernel } from "../../../shared/kernel/IKernel";
import { Queue } from "../../messaging/Queue";
import { ILogLine } from "../../../shared/logging/types/ILogLine";
import { IKernelElement } from "../../../shared/kernel/IKernelElement";

export class LogTargetFile extends KernelElement implements ILogTarget {
  constructor(readonly kernel: IKernel, parent: IKernelElement) {
    super("log-target-file", kernel, parent);

    this.queue = new Queue("logging", kernel, this);
  }

  private outputInterval?: NodeJS.Timer;

  async initialize(): Promise<void> {
    this.outputInterval = setTimeout(() => {
      this.dequeueLogs().catch((e) =>
        this.log.error("file output loop failed", e)
      );
    }, 200);
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
      }, 200);
  }

  queue: Queue<ILogLine>;

  appendLog(line: ILogLine): void {
    this.queue.enqueue(line);
  }

  private async appendLines(lines: ILogLine[]): Promise<boolean> {
    const logVolume = await this.kernel.storage.getVolume("logs");
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
      `${timeSegments}-ludivine.log`,
      Buffer.from(dump, "utf-8")
    );
  }

  private toTimeLogsString(timestamp?: Date): string {
    if (timestamp == null) timestamp = new Date();

    const formatData = (input: number): string => {
      if (input > 9) {
        return String(input);
      } else return `0${input}`;
    };

    const format = {
      YY: timestamp.getFullYear(),
      MM: formatData(timestamp.getMonth()),
      DD: formatData(timestamp.getDate()),
      HH: formatData(timestamp.getHours()),
    };
    return `${format.YY}-${format.MM}-${format.DD}-${format.HH}`;
  }
}
