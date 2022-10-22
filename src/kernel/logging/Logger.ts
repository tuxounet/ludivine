import { KernelElement } from "../bases/KernelElement";

export class Logger {
  constructor(readonly sender: KernelElement) {}

  debug(...messageParts: unknown[]) {
    console.debug(
      this.buildOutput("DBG", this.sender.fullName, ...messageParts)
    );
  }

  input(...messageParts: unknown[]) {
    console.info(
      this.buildOutput("INP", this.sender.fullName, ...messageParts)
    );
  }

  info(...messageParts: unknown[]) {
    console.info(
      this.buildOutput("INF", this.sender.fullName, ...messageParts)
    );
  }

  warn(...messageParts: unknown[]) {
    console.warn(
      this.buildOutput("WRN", this.sender.fullName, ...messageParts)
    );
  }

  error(...messageParts: unknown[]) {
    console.error(
      this.buildOutput("ERR", this.sender.fullName, ...messageParts)
    );
  }

  private buildOutput(level: string, ...messageParts: unknown[]) {
    const parts = [
      this.toTimeString(),
      level,
      this.sender.fullName,
      ...messageParts,
    ];
    return parts
      .map((item) => {
        if (typeof item === "string") return item;
        if (item instanceof Error)
          return `${item.name}: ${item.message} ${item.stack}`;
        return JSON.stringify(item);
      })
      .join(" ");
  }

  private toTimeString(timestamp?: Date) {
    if (!timestamp) timestamp = new Date();

    const formatData = (input: number) => {
      if (input > 9) {
        return input;
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
