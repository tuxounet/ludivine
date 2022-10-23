import { KernelElement } from "../bases/KernelElement";
import { LogLevels } from "./_index";

export class Logger {
  constructor(
    readonly sender: KernelElement,
    readonly callback: (level: LogLevels, line: string) => void
  ) {}

  debug(...messageParts: unknown[]): void {
    this.callback(
      "DEBUG",
      this.buildOutput(this.sender.fullName, ...messageParts)
    );
  }

  input(...messageParts: unknown[]): void {
    this.callback(
      "INPUT",
      this.buildOutput(this.sender.fullName, ...messageParts)
    );
  }

  info(...messageParts: unknown[]): void {
    this.callback(
      "INFO",
      this.buildOutput(this.sender.fullName, ...messageParts)
    );
  }

  warn(...messageParts: unknown[]): void {
    this.callback(
      "WARN",
      this.buildOutput(this.sender.fullName, ...messageParts)
    );
  }

  error(...messageParts: unknown[]): void {
    this.callback(
      "ERROR",
      this.buildOutput(this.sender.fullName, ...messageParts)
    );
  }

  private buildOutput(...messageParts: unknown[]): string {
    const parts = [this.toTimeString(), this.sender.fullName, ...messageParts];
    return parts
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
