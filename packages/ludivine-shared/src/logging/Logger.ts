import { IKernelElement } from "../kernel/IKernelElement";
import { ILogLine } from "./types/ILogLine";

export class Logger {
  constructor(
    readonly sender: IKernelElement,
    readonly callback: (line: ILogLine) => void
  ) {}

  debug(...messageParts: unknown[]): void {
    this.callback({
      level: "DEBUG",
      date: this.toTimeString(),
      sender: this.sender.fullName,
      line: this.buildOutput(...messageParts),
    });
  }

  input(...messageParts: unknown[]): void {
    this.callback({
      level: "INPUT",
      date: this.toTimeString(),
      sender: this.sender.fullName,
      line: this.buildOutput(...messageParts),
    });
  }

  info(...messageParts: unknown[]): void {
    this.callback({
      level: "INFO",
      date: this.toTimeString(),
      sender: this.sender.fullName,
      line: this.buildOutput(...messageParts),
    });
  }

  warn(...messageParts: unknown[]): void {
    this.callback({
      level: "WARN",
      date: this.toTimeString(),
      sender: this.sender.fullName,
      line: this.buildOutput(...messageParts),
    });
  }

  error(...messageParts: unknown[]): void {
    this.callback({
      level: "ERROR",
      date: this.toTimeString(),
      sender: this.sender.fullName,
      line: this.buildOutput(...messageParts),
    });
  }

  private buildOutput(...messageParts: unknown[]): string {
    return messageParts
      .map((item) => {
        if (typeof item === "string") return item;
        if (item instanceof Error)
          return `${item.name}: ${item.message} ${item.stack ?? ""}`;
        return JSON.stringify(item);
      })
      .join(" ");
  }

  private toTimeString(timestamp?: Date): string {
    if (timestamp == null) timestamp = new Date();

    const formatData = (input: number): string => {
      if (input > 9) {
        return String(input);
      } else return `0${input}`;
    };

    const format = {
      HH: formatData(timestamp.getHours()),
      MM: formatData(timestamp.getMinutes()),
      SS: formatData(timestamp.getSeconds()),
    };
    return `${format.HH}:${format.MM}:${format.SS}`;
  }
}
