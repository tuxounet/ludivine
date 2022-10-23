import { LogLevels } from "./LogLevels";

export interface ILogLine {
  level: LogLevels;
  sender: string;
  date: string;
  line: string;
}
