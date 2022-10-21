import { LogLevels } from "./LogLevels";

export interface ILogTarget {
  appendLog(level: LogLevels, ...parts: string[]): void;
}
